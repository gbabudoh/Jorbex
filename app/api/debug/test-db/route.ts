import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');

    // Simple query to test connection
    const candidateCount = await prisma.candidate.count();
    const employerCount = await prisma.employer.count();
    const jobCount = await prisma.job.count();

    return NextResponse.json({
      success: true,
      database: 'PostgreSQL (Prisma)',
      counts: { candidates: candidateCount, employers: employerCount, jobs: jobCount },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database connection failed';
    return NextResponse.json({
      success: false,
      error: message,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'NOT SET',
    }, { status: 500 });
  }
}
