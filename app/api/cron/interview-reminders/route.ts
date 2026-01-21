import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Interview from '@/models/Interview';
import { sendNotification, TEMPLATE_IDS } from '@/lib/notifications';

// This endpoint should be called by a cron service (e.g., GitHub Actions, EasyCron, or Vercel Cron)
// Protected by a secret key
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Quick secret check (ideally rely on Authorization header but query param is common for simple cron)
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    // buffer to ensure we don't miss any if cron is slightly delayed, or duplicate if too frequent.
    // We rely on `sent: false` to avoid duplicates.
    
    // Find interviews with reminders due
    // remindAt <= now AND sent = false
    const interviews = await Interview.find({
      'reminders.remindAt': { $lte: now },
      'reminders.sent': false,
      status: { $in: ['confirmed', 'pending'] } // Only active interviews
    }).populate('candidateId employerId');

    let processedCount = 0;
    let errorsCount = 0;

    for (const interview of interviews) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const candidate = interview.candidateId as any;
      const employer = interview.employerId as any;
      const job = interview.jobId as any;

      // Filter for due reminders
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const dueReminders = interview.reminders.filter(
        (r: any) => !r.sent && new Date(r.remindAt) <= now
      );

      for (const reminder of dueReminders) {
        const timeDiff = new Date(interview.dateTime).getTime() - new Date().getTime();
        const minutesUntil = Math.max(0, Math.floor(timeDiff / 60000));

        try {
          // Send to Candidate
          await sendNotification(
            { ...candidate.toObject(), userType: 'candidate' },
            {
              title: `Interview Reminder: ${employer.companyName}`,
              message: `You have an interview with ${employer.companyName} at ${new Date(interview.dateTime).toLocaleTimeString()}.`,
              emailTemplateId: TEMPLATE_IDS.INTERVIEW_REMINDER,
              emailData: {
                candidateName: candidate.name,
                position: job?.title || 'Candidate',
                companyName: employer.companyName,
                time: new Date(interview.dateTime).toLocaleTimeString(),
                minutesUntil: minutesUntil,
                meetingUrl: interview.meetingUrl,
              },
              type: 'interviewReminders',
              actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interview._id}`,
            }
          );

          // Mark as sent
          reminder.sent = true;
          reminder.sentAt = new Date();
          processedCount++;
        } catch (err: any) {
          console.error(`Failed to send reminder for interview ${interview._id}`, err);
          reminder.error = err.message;
          errorsCount++;
        }
      }
      
      // Save changes to interview document
      await interview.save();
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorsCount,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cron Reminder Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
