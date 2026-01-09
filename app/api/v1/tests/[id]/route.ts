import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AptitudeTest from '@/models/AptitudeTest';
import TestResult from '@/models/TestResult';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    await dbConnect();

    if (session.user.userType === 'candidate') {
      // Find the test assigned to candidate
      const test = await AptitudeTest.findOne({
        _id: id,
        candidateId: session.user.id,
        isActive: true,
      });

      if (!test) {
        return NextResponse.json(
          { error: 'Test not found or not assigned to you' },
          { status: 404 }
        );
      }

      // Check if already completed
      const result = await TestResult.findOne({
        testId: id,
        candidateId: session.user.id,
      });

      if (result) {
        return NextResponse.json(
          { error: 'You have already completed this test', result },
          { status: 400 }
        );
      }

      return NextResponse.json({ test }, { status: 200 });
    } else if (session.user.userType === 'employer') {
      // Find test owned by employer
      const test = await AptitudeTest.findOne({
        _id: id,
        employerId: session.user.id
      });

      if (!test) {
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ test }, { status: 200 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    await dbConnect();

    const updatedTest = await AptitudeTest.findOneAndUpdate(
      { _id: id, employerId: session.user.id },
      { $set: body },
      { new: true }
    );

    if (!updatedTest) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, test: updatedTest }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    const result = await AptitudeTest.deleteOne({ _id: id, employerId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Test deleted' }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
