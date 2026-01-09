import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AptitudeTest from '@/models/AptitudeTest';

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

    const tests = await AptitudeTest.find({
      employerId: session.user?.id,
      testType: 'employer_custom',
    }).sort({ createdAt: -1 });

    return NextResponse.json({ tests }, { status: 200 });
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
    const { title, description, questions, passingScore, timeLimit } = body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: title and at least one question are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newTest = new AptitudeTest({
      title,
      description,
      testType: 'employer_custom',
      employerId: session.user.id,
      questions,
      passingScore: passingScore || 70,
      timeLimit,
      isActive: true,
    });

    await newTest.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Test created successfully',
      testId: newTest._id 
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to create test:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
