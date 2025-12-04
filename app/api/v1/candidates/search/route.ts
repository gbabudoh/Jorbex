import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Candidate from '@/models/Candidate';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const expertise = searchParams.get('expertise');
    const skill = searchParams.get('skill');
    const minScore = searchParams.get('minScore');

    const query: any = {
      onboardingTestPassed: true,
    };

    if (expertise) {
      query.expertise = expertise;
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    let candidates = await Candidate.find(query).select('-password');

    if (minScore) {
      const minScoreNum = parseInt(minScore);
      candidates = candidates.filter(
        (candidate) => (candidate.onboardingTestScore || 0) >= minScoreNum
      );
    }

    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to search candidates' },
      { status: 500 }
    );
  }
}

