import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Employer from '@/models/Employer';

export async function GET() {
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

    return NextResponse.json(employer, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, companyName, phone, country, city } = body;

    const employer = await Employer.findByIdAndUpdate(
      session.user?.id,
      {
        ...(name && { name }),
        ...(companyName && { companyName }),
        ...(phone && { phone }),
        ...(country && { country }),
        ...(city && { city }),
      },
      { new: true }
    ).select('-password');

    if (!employer) {
      return NextResponse.json(
        { error: 'Employer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employer, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}
