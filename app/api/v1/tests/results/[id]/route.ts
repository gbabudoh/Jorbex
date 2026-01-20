import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import TestResult from '@/models/TestResult';
import Candidate from '@/models/Candidate';
import AptitudeTest from '@/models/AptitudeTest';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const user = session.user as { id: string; userType: string };
    const employerId = user.id;

    if (!employerId) {
      return NextResponse.json(
        { error: 'Invalid session: Employer ID missing' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the specific result and ensure it belongs to this employer
    const result = await TestResult.findOne({
      _id: id,
      employerId: employerId
    })
    .populate({
      path: 'candidateId',
      select: 'name email expertise',
      model: Candidate
    })
    .populate({
      path: 'testId',
      select: 'title description questions',
      model: AptitudeTest
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ result }, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch result details';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
