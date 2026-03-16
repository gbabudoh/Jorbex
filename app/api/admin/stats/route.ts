import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [
    candidateCount,
    employerCount,
    jobCount,
    applicationCount,
    interviewCount,
    activeSubscriptions,
    trialSubscriptions,
    recentCandidates,
    recentEmployers,
  ] = await Promise.all([
    prisma.candidate.count(),
    prisma.employer.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.interview.count(),
    prisma.employer.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    prisma.employer.count({ where: { subscriptionStatus: 'TRIAL' } }),
    prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, expertise: true, createdAt: true },
    }),
    prisma.employer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, companyName: true, email: true, subscriptionStatus: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    stats: { candidateCount, employerCount, jobCount, applicationCount, interviewCount, activeSubscriptions, trialSubscriptions },
    recentCandidates,
    recentEmployers,
  });
}
