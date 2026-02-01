import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Interview from '@/models/Interview';
import Candidate from '@/models/Candidate';
import Employer from '@/models/Employer';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { sendNotification } from '@/lib/notifications';
import { TEMPLATE_IDS } from '@/lib/listmonk';
import { mattermost } from '@/lib/mattermost'; // Optional integration

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Sanitize jobId - treat empty string as undefined
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
    const employer = await Employer.findById(employerId);
    const candidate = await Candidate.findById(candidateId);
    
    // Fetch job if ID provided, otherwise null
    const job = jobId ? await Job.findById(jobId) : null;
    
    // Validate entities
    if (!employer || !candidate) {
      return NextResponse.json({ error: 'Employer or Candidate not found' }, { status: 404 });
    }
    
    // If jobId provided but job not found
    if (jobId && !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const positionTitle = job ? job.title : jobTitle;

    const scheduledDate = new Date(dateTime);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // 3. Generate Jitsi URL
    // Standard Jitsi URL: https://meet.jit.si/ROOM_NAME
    // We use the env variable for the base domain
    const jitsiBaseUrl = process.env.NEXT_PUBLIC_JITSI_URL || 'https://meet.jit.si';
    // Create a unique room name. Using IDs ensures uniqueness but we might want it obfuscated.
    // jorbex-interview-{randomString}-{timestamp}
    const safeRoomName = `jorbex-interview-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    const meetingUrl = `${jitsiBaseUrl}/${safeRoomName}`;

    // 4. Create Reminders
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const reminders: any[] = [];
    const remindTimes = [
      { type: 'DAY_BEFORE', ms: 24 * 60 * 60 * 1000 },
      { type: 'HOUR_BEFORE', ms: 60 * 60 * 1000 },
      { type: 'FIFTEEN_MINUTES', ms: 15 * 60 * 1000 },
    ];

    remindTimes.forEach(rt => {
      const remindAt = new Date(scheduledDate.getTime() - rt.ms);
      if (remindAt > new Date()) { // Only add if in future
        reminders.push({
          remindAt,
          type: rt.type,
          channel: 'BOTH',
          sent: false,
        });
      }
    });

    // 5. Create Interview Document
    const interview = await Interview.create({
      employerId,
      candidateId,
      jobId: jobId || undefined, // Ensure empty string doesn't get saved
      jobTitle: positionTitle, // Save the resolved title
      applicationId,
      dateTime: scheduledDate,
      duration,
      type,
      location: type === 'virtual' ? 'Jorbex Video Interview' : location,
      meetingUrl: type === 'virtual' ? meetingUrl : undefined,
      meetingRoomName: type === 'virtual' ? safeRoomName : undefined,
      candidateMeetingUrl: type === 'virtual' ? meetingUrl : undefined, // Could be same
      employerMeetingUrl: type === 'virtual' ? meetingUrl : undefined, // Could be same
      notes,
      reminders,
      status: 'confirmed', // Assuming direct schedule is confirmed
    });

    // 6. Notifications
    // Notify Candidate
    const candidateObj = candidate.toObject();
    await sendNotification(
      { 
        ...candidateObj, 
        _id: candidateObj._id.toString(), // Ensure _id is string
        userType: 'candidate' 
      },
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
          meetingUrl: meetingUrl,
          interviewId: interview._id,
        },
        type: 'interviews',
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interview._id}`,
      }
    );

    // Update Application Status (if provided)
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, { status: 'interviewing' });
    }

    // 7. Mattermost (Optional)
    if (employer.mattermostTeamId && jobId) {
      // Find relevant channel
      // For now just use a generic 'hiring' channel or try to find one from employer.mattermostChannels
      const channelRef = employer.mattermostChannels?.find((c: any) => c.jobId.toString() === jobId.toString());
      if (channelRef) {
        await mattermost.postMessage({
          channelId: channelRef.channelId,
          message: `📅 **Interview Scheduled**\nCandidate: ${candidate.name}\nDate: ${scheduledDate.toLocaleString()}\n[Join Meeting](${meetingUrl})`,
        }).catch((err: any) => console.error('Failed to post to Mattermost', err));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        interviewId: interview._id,
        meetingUrl: interview.meetingUrl,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Schedule Interview Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
