import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';
import { TEMPLATE_IDS } from '@/lib/listmonk';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find interviews with unsent reminders that are due
    const interviews = await prisma.interview.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PENDING'] },
        reminders: {
          some: {
            sent: false,
            remindAt: { lte: now },
          },
        },
      },
      include: {
        candidate: true,
        employer: true,
        job: true,
        reminders: {
          where: { sent: false, remindAt: { lte: now } },
        },
      },
    });

    let processedCount = 0;
    let errorsCount = 0;

    for (const interview of interviews) {
      for (const reminder of interview.reminders) {
        const timeDiff = new Date(interview.dateTime).getTime() - Date.now();
        const minutesUntil = Math.max(0, Math.floor(timeDiff / 60000));

        try {
          await sendNotification(
            { ...interview.candidate, _id: interview.candidate.id, userType: 'candidate' },
            {
              title: `Interview Reminder: ${interview.employer.companyName}`,
              message: `You have an interview with ${interview.employer.companyName} at ${new Date(interview.dateTime).toLocaleTimeString()}.`,
              emailTemplateId: TEMPLATE_IDS.INTERVIEW_REMINDER,
              emailData: {
                candidateName: interview.candidate.name,
                position: interview.job?.title || 'Candidate',
                companyName: interview.employer.companyName,
                time: new Date(interview.dateTime).toLocaleTimeString(),
                minutesUntil,
                meetingUrl: interview.meetingUrl,
              },
              type: 'interviews',
              actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interview.id}`,
            }
          );

          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { sent: true, sentAt: new Date() },
          });
          processedCount++;
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Failed to send reminder for interview ${interview.id}`, err);
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { error: errMsg },
          });
          errorsCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cron error';
    console.error('Cron Reminder Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
