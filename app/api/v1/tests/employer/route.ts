import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AptitudeTest from '@/models/AptitudeTest';

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

    const tests = await AptitudeTest.find({
      employerId: session.user?.id,
      testType: 'employer_custom',
    }).sort({ createdAt: -1 });

    return NextResponse.json({ tests }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

