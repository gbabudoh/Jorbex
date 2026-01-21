import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AptitudeTest from '@/models/AptitudeTest';
import Employer from '@/models/Employer';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify employer
    const employer = await Employer.findById(session.user.id);
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // Find tests created by this employer that are TEMPLATES (no candidate assigned)
    const tests = await AptitudeTest.find({
      employerId: employer._id,
      candidateId: { $exists: false }, // Only templates
      testType: 'employer_custom',
      isActive: true,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ tests });
  } catch (error: unknown) {
    console.error('Error fetching employer tests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
