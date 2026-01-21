import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Employer from '@/models/Employer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');

    if (!employerId) {
      return NextResponse.json({ error: 'Missing employerId' }, { status: 400 });
    }

    await dbConnect();
    const employer = await Employer.findById(employerId).select('mattermostChannels');

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    return NextResponse.json({ channels: employer.mattermostChannels || [] });

  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
