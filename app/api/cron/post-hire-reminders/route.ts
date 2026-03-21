import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyPostHire } from '@/lib/notifications';

// GET /api/cron/post-hire-reminders?secret=xxx
// Schedule: run daily — checks for applications hired 1, 30, 90, 180 days ago
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('secret') !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now   = new Date();
    const hired = await prisma.application.findMany({
      where: { status: 'HIRED' },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        offer: {
          include: {
            employer: { select: { id: true, companyName: true } },
            job:      { select: { title: true } },
          },
        },
        postHireLogs: true,
      },
    });

    const MILESTONES: { type: 'day1' | 'day30' | 'day90' | 'month6'; days: number }[] = [
      { type: 'day1',   days: 1   },
      { type: 'day30',  days: 30  },
      { type: 'day90',  days: 90  },
      { type: 'month6', days: 180 },
    ];

    let sent = 0;

    for (const app of hired) {
      if (!app.offer) continue;

      const hireDate = app.updatedAt; // set when status changed to HIRED
      const daysSince = Math.floor((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24));

      for (const milestone of MILESTONES) {
        // Only fire within a 1-day window of the milestone
        if (Math.abs(daysSince - milestone.days) > 1) continue;

        // Skip if already sent
        const alreadySent = app.postHireLogs.some(l => l.type === milestone.type);
        if (alreadySent) continue;

        try {
          await notifyPostHire({
            type:           milestone.type,
            candidateId:    app.candidate.id,
            candidateEmail: app.candidate.email,
            candidateName:  app.candidate.name,
            employerId:     app.offer.employer.id,
            companyName:    app.offer.employer.companyName,
            position:       app.offer.job?.title ?? 'Position',
          });

          await prisma.postHireLog.create({
            data: { applicationId: app.id, type: milestone.type },
          });

          sent++;
        } catch (err) {
          console.error(`[PostHire] failed for app ${app.id} type ${milestone.type}:`, err);
        }
      }
    }

    return NextResponse.json({ success: true, notificationsSent: sent });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
