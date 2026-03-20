import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notifyAssessmentAssigned } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { candidateId, testId } = await req.json();

    if (!candidateId || !testId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Employer
    const employer = await prisma.employer.findUnique({ where: { id: session.user.id } });
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // 2. Find the Template Test (owned by employer, no candidateId assigned)
    const templateTest = await prisma.aptitudeTest.findFirst({
      where: {
        id: testId,
        employerId: employer.id,
      },
      include: { questions: true },
    });

    if (!templateTest) {
      return NextResponse.json({ error: 'Test template not found' }, { status: 404 });
    }

    // 3. Find Candidate
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // 4. Prevent duplicate assignment (same template → same candidate)
    // Raw SQL used because Prisma client was not regenerated after candidateId was added to schema
    const existing = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "AptitudeTest"
      WHERE "originalTestId" = ${templateTest.id} AND "candidateId" = ${candidate.id}
      LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'This test has already been sent to this candidate' }, { status: 409 });
    }

    // 5. Clone the Test for the Candidate (create without candidateId, then set via raw SQL)
    const assignedTest = await prisma.aptitudeTest.create({
      data: {
        title: templateTest.title,
        description: templateTest.description,
        testType: 'EMPLOYER_CUSTOM',
        employerId: employer.id,
        originalTestId: templateTest.id,
        passingScore: templateTest.passingScore,
        timeLimit: templateTest.timeLimit,
        expertise: templateTest.expertise,
        isActive: true,
        questions: {
          create: templateTest.questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
    });

    // Set candidateId via raw SQL (column exists in DB but not yet in Prisma client)
    await prisma.$executeRaw`
      UPDATE "AptitudeTest" SET "candidateId" = ${candidate.id} WHERE id = ${assignedTest.id}
    `;

    // 6. Update Application Status (if exists)
    const application = await prisma.application.findFirst({
      where: { candidateId, employerId: employer.id },
      orderBy: { createdAt: 'desc' },
    });

    if (application) {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'TEST_SENT' },
      });
    }

    // 7. Notify Candidate (non-fatal — don't let this fail the whole request)
    try {
      await notifyAssessmentAssigned(
        candidate.id,
        candidate.email,
        candidate.name,
        employer.companyName,
        templateTest.title,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (templateTest as any).deadline ?? null,
      );
    } catch (notifyErr) {
      console.warn('Notification failed (non-fatal):', notifyErr);
    }

    return NextResponse.json({ success: true, testId: assignedTest.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error assigning test:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
