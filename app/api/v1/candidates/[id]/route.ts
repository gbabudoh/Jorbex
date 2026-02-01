import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Candidate from '@/models/Candidate';

export const dynamic = 'force-dynamic';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized. Only employers can view candidate details.' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id: candidateId } = await params;
    
    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    const candidate = await Candidate.findById(candidateId).select('-password').lean();
    console.log(`[API] Fetching candidate ${candidateId}:`, candidate ? { id: candidate._id, city: candidate.city, country: candidate.country } : 'Not found');

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Only return candidates who have passed onboarding
    if (!candidate.onboardingTestPassed) {
      return NextResponse.json(
        { error: 'This candidate has not completed the onboarding process' },
        { status: 403 }
      );
    }

    return NextResponse.json({ candidate }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candidate details' },
      { status: 500 }
    );
  }
}

