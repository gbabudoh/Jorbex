import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Employer from '@/models/Employer';

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

    const employer = await Employer.findById(session.user?.id).select('-password');

    if (!employer) {
      return NextResponse.json(
        { error: 'Employer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: employer.subscriptionStatus,
        subscriptionStartDate: employer.subscriptionStartDate,
        subscriptionEndDate: employer.subscriptionEndDate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

