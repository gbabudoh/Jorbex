import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Employer from '@/models/Employer';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ employers: [] }, { status: 200 });
    }

    // Search by company name or owner name
    const employers = await Employer.find({
      $or: [
        { companyName: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name companyName _id')
    .limit(10);

    return NextResponse.json({ employers }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search employers';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
