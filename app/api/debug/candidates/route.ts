import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Candidate from '@/models/Candidate';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    console.log('Debug endpoint called:', { email, name });

    try {
      await dbConnect();
      console.log('Database connected');
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: dbError.message,
          mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        },
        { status: 500 }
      );
    }

    let query: any = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    }
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    console.log('Querying candidates with:', query);
    const candidates = await Candidate.find(query).select('-password').limit(20);
    console.log('Found candidates:', candidates.length);

    return NextResponse.json(
      {
        count: candidates.length,
        candidates: candidates.map((c) => ({
          id: c._id,
          name: c.name,
          email: c.email,
          expertise: c.expertise,
          onboardingTestPassed: c.onboardingTestPassed,
          onboardingTestScore: c.onboardingTestScore,
          createdAt: c.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch candidates', details: error },
      { status: 500 }
    );
  }
}

