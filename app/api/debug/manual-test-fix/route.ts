import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Candidate from '@/models/Candidate';
import TestResult from '@/models/TestResult';
import mongoose from 'mongoose';

/**
 * Manual test fix endpoint for Godwin Babudoh
 * POST to this endpoint to manually mark the test as completed
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, score = 80 } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the candidate
    const candidate = await Candidate.findOne({ email: email.toLowerCase().trim() });
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const passed = score >= 70;

    // Check if test result already exists
    const existingResult = await TestResult.findOne({ candidateId: candidate._id });
    
    if (existingResult) {
      return NextResponse.json(
        { 
          message: 'Test result already exists',
          testResult: {
            id: existingResult._id,
            score: existingResult.score,
            passed: existingResult.passed,
            completedAt: existingResult.completedAt,
          }
        },
        { status: 200 }
      );
    }

    // Create test result
    const testResult = await TestResult.create({
      testId: new mongoose.Types.ObjectId(),
      candidateId: candidate._id,
      answers: [
        { questionId: 'manual', selectedAnswer: 'Manual entry', isCorrect: true },
      ],
      score,
      passingScore: 70,
      passed,
      completedAt: new Date(),
    });

    // Update candidate
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidate._id,
      {
        onboardingTestPassed: passed,
        onboardingTestScore: score,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: 'Test result created and candidate updated successfully',
        candidate: {
          id: updatedCandidate?._id,
          name: updatedCandidate?.name,
          email: updatedCandidate?.email,
          onboardingTestPassed: updatedCandidate?.onboardingTestPassed,
          onboardingTestScore: updatedCandidate?.onboardingTestScore,
        },
        testResult: {
          id: testResult._id,
          score: testResult.score,
          passed: testResult.passed,
          completedAt: testResult.completedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Manual test fix error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check current status
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const candidate = await Candidate.findOne({ email: email.toLowerCase().trim() });
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const testResults = await TestResult.find({ candidateId: candidate._id });

    return NextResponse.json({
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        onboardingTestPassed: candidate.onboardingTestPassed,
        onboardingTestScore: candidate.onboardingTestScore,
      },
      testResults: testResults.map(tr => ({
        id: tr._id,
        score: tr.score,
        passed: tr.passed,
        completedAt: tr.completedAt,
      })),
      totalTestResults: testResults.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
