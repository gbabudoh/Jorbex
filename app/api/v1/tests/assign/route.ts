import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AptitudeTest from '@/models/AptitudeTest';
import Employer from '@/models/Employer';
import Candidate from '@/models/Candidate';
import Application from '@/models/Application';
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

    await dbConnect();

    // 1. Verify Employer
    const employer = await Employer.findById(session.user.id);
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // 2. Find the Template Test
    const templateTest = await AptitudeTest.findOne({
      _id: testId,
      employerId: employer._id,
      candidateId: { $exists: false },
    });

    if (!templateTest) {
      return NextResponse.json({ error: 'Test template not found' }, { status: 404 });
    }

    // 3. Find Candidate
    const candidate = await Candidate.findById(candidateId).populate('userId');
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // 4. Clone the Test for the Candidate
    const assignedTest = await AptitudeTest.create({
      title: templateTest.title,
      description: templateTest.description,
      testType: 'employer_custom',
      employerId: employer._id,
      candidateId: candidateId,
      originalTestId: templateTest._id,
      questions: templateTest.questions,
      passingScore: templateTest.passingScore,
      timeLimit: templateTest.timeLimit,
      expertise: templateTest.expertise,
      isActive: true,
    });

    // 5. Update Application Status (if exists)
    // Find application between this candidate and employer (optional logic, but good for flow)
    const application = await Application.findOne({
      candidateId: candidateId,
      employerId: employer._id,
    }).sort({ createdAt: -1 });

    if (application) {
      application.status = 'test_sent';
      await application.save();
    }

    // 6. Notify Candidate
    // We construct a link to take the test. Assuming a route like /dashboard/tests/[id]
    const testLink = `${process.env.NEXTAUTH_URL}/dashboard/tests/${assignedTest._id}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyCandidate = candidate as any;

    if (anyCandidate.userId) { // If candidate has a User account linked
      await sendPushNotification({
        topic: anyCandidate.ntfyTopic || `user_${anyCandidate.userId}`, 
        userType: 'candidate',
        userId: anyCandidate.userId.toString(),
        title: '📝 New Assessment Assigned',
        message: `${employer.companyName} has sent you an aptitude test: "${templateTest.title}".`,
        click: testLink,
        priority: 3
      });
    }

    return NextResponse.json({ success: true, testId: assignedTest._id });
  } catch (error: unknown) {
    console.error('Error assigning test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
