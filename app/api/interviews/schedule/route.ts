import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';
import { TEMPLATE_IDS } from '@/lib/listmonk';
import { mattermost } from '@/lib/mattermost';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawJobId = body.jobId;
    const jobId = rawJobId && rawJobId.trim() !== '' ? rawJobId : undefined;
    const { employerId, candidateId, jobTitle, applicationId, dateTime, duration = 30, type = 'virtual', location = 'Remote', notes } = body;

    // 1. Basic Validation
    if (!employerId || !candidateId || !dateTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!jobId && !jobTitle) {
      return NextResponse.json({ error: 'Either Job Position or Job Title is required' }, { status: 400 });
    }

    // 2. Fetch Entities
    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
      include: { mattermostChannels: true },
    });
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    const job = jobId ? await prisma.job.findUnique({ where: { id: jobId } }) : null;

    if (!employer || !candidate) {
      return NextResponse.json({ error: 'Employer or Candidate not found' }, { status: 404 });
    }
    if (jobId && !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const positionTitle = job ? job.title : jobTitle;
    const scheduledDate = new Date(dateTime);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // 3. Generate LiveKit room name (meeting happens on our own interview page)
    const safeRoomName = `jorbex-interview-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    // The meetingUrl will be updated after interview creation with the actual ID
    const placeholderMeetingUrl = `${baseAppUrl}/interview`;

    // 4. Create Reminders data
    const remindTimes = [
      { type: 'DAY_BEFORE' as const, ms: 24 * 60 * 60 * 1000 },
      { type: 'HOUR_BEFORE' as const, ms: 60 * 60 * 1000 },
      { type: 'FIFTEEN_MINUTES' as const, ms: 15 * 60 * 1000 },
    ];

    const remindersData = remindTimes
      .map((rt) => {
        const remindAt = new Date(scheduledDate.getTime() - rt.ms);
        if (remindAt > new Date()) {
          return { remindAt, type: rt.type, channel: 'BOTH' as const, sent: false };
        }
        return null;
      })
      .filter(Boolean) as { remindAt: Date; type: 'DAY_BEFORE' | 'HOUR_BEFORE' | 'FIFTEEN_MINUTES'; channel: 'BOTH'; sent: boolean }[];

    // 5. Create Interview
    const interview = await prisma.interview.create({
      data: {
        employerId,
        candidateId,
        jobId: jobId || undefined,
        jobTitle: positionTitle,
        dateTime: scheduledDate,
        duration,
        type: type.toUpperCase() as 'VIRTUAL' | 'PHYSICAL',
        location: type === 'virtual' ? 'Jorbex Video Interview' : location,
        meetingUrl: type === 'virtual' ? placeholderMeetingUrl : undefined,
        meetingRoomName: type === 'virtual' ? safeRoomName : undefined,
        candidateMeetingUrl: type === 'virtual' ? placeholderMeetingUrl : undefined,
        employerMeetingUrl: type === 'virtual' ? placeholderMeetingUrl : undefined,
        notes,
        status: 'CONFIRMED',
        reminders: {
          create: remindersData,
        },
      },
    });

    // Update meeting URLs with actual interview ID
    const meetingUrl = `${baseAppUrl}/interview/${interview.id}`;
    if (type === 'virtual') {
      await prisma.interview.update({
        where: { id: interview.id },
        data: { meetingUrl, candidateMeetingUrl: meetingUrl, employerMeetingUrl: meetingUrl },
      });
    }

    // 6. Notifications
    await sendNotification(
      { ...candidate, _id: candidate.id, userType: 'candidate' },
      {
        title: 'Interview Scheduled',
        message: `An interview with ${employer.companyName} has been scheduled for ${scheduledDate.toLocaleString()}.`,
        emailTemplateId: TEMPLATE_IDS.INTERVIEW_INVITATION,
        emailData: {
          candidateName: candidate.name,
          position: positionTitle,
          companyName: employer.companyName,
          date: scheduledDate.toLocaleDateString(),
          time: scheduledDate.toLocaleTimeString(),
          meetingUrl,
          interviewId: interview.id,
        },
        type: 'interviews',
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interview.id}`,
      }
    );

    // Update Application Status
    if (applicationId) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'INTERVIEW_SCHEDULED' },
      });
    }

    // 7. Mattermost (Optional)
    if (employer.mattermostTeamId && jobId) {
      const channelRef = employer.mattermostChannels?.find((c) => c.jobId === jobId);
      if (channelRef) {
        await mattermost.postMessage({
          channelId: channelRef.channelId,
          message: `📅 **Interview Scheduled**\nCandidate: ${candidate.name}\nDate: ${scheduledDate.toLocaleString()}\n[Join Meeting](${meetingUrl})`,
        }).catch((err: unknown) => console.error('Failed to post to Mattermost', err));
      }
    }

    return NextResponse.json({
      success: true,
      data: { interviewId: interview.id, meetingUrl: interview.meetingUrl },
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Schedule Interview Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
