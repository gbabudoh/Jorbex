import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/ntfy';

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

    // 4. Clone the Test for the Candidate
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

    // 5. Update Application Status (if exists)
    const application = await prisma.application.findFirst({
      where: {
        candidateId: candidateId,
        employerId: employer.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (application) {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'TEST_SENT' },
      });
    }

    // 6. Notify Candidate
    const testLink = `${process.env.NEXTAUTH_URL}/dashboard/tests/${assignedTest.id}`;

    if (candidate.ntfyTopic) {
      await sendPushNotification({
        topic: candidate.ntfyTopic,
        userType: 'candidate',
        userId: candidate.id,
        title: '📝 New Assessment Assigned',
        message: `${employer.companyName} has sent you an aptitude test: "${templateTest.title}".`,
        click: testLink,
        priority: 3,
      });
    }

    return NextResponse.json({ success: true, testId: assignedTest.id });
  } catch (error: unknown) {
    console.error('Error assigning test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
