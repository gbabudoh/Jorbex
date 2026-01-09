import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Interview from '@/models/Interview';
import Candidate from '@/models/Candidate';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    let query = {};
    if (session.user.userType === 'employer') {
      query = { employerId: session.user.id };
    } else if (session.user.userType === 'candidate') {
      query = { candidateId: session.user.id };
    }

    const interviews = await Interview.find(query)
      .populate('employerId', 'name companyName')
      .populate('candidateId', 'name phone expertise')
      .sort({ dateTime: 1 });

    return NextResponse.json({ interviews }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { candidateId, dateTime, type, location, notes } = body;

    // Validation
    if (!candidateId || !dateTime || !type || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateId, dateTime, type, and location are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify candidate exists
    const candidateExists = await Candidate.findById(candidateId);
    if (!candidateExists) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Create the interview
    const newInterview = new Interview({
      employerId: session.user.id,
      candidateId,
      dateTime: new Date(dateTime),
      type,
      location,
      notes,
      status: 'pending',
    });

    await newInterview.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Interview scheduled successfully',
      interviewId: newInterview._id 
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to schedule interview:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
