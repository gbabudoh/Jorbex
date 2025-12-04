import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Candidate from '@/models/Candidate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, expertise } = body;

    if (!name || !email || !password || !phone || !expertise) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    try {
      await dbConnect();
      console.log('Database connected successfully');
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: `Database connection failed: ${dbError.message}. Please check your MongoDB connection in .env.local` },
        { status: 500 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ email: normalizedEmail });
    if (existingCandidate) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new candidate
    console.log('Attempting to create candidate:', { 
      name: name.trim(), 
      email: normalizedEmail,
      phone: phone.trim(),
      expertise,
    });
    
    let candidate;
    try {
      candidate = await Candidate.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone: phone.trim(),
        expertise,
        skills: [],
        workHistory: [],
        references: [],
        onboardingTestPassed: false,
      });

      console.log('Candidate created successfully:', {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        createdAt: candidate.createdAt,
      });
    } catch (createError: any) {
      console.error('Candidate creation error:', createError);
      
      // Handle validation errors
      if (createError.name === 'ValidationError') {
        const validationErrors = Object.values(createError.errors).map((err: any) => err.message);
        return NextResponse.json(
          { error: `Validation error: ${validationErrors.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Handle duplicate key error
      if (createError.code === 11000) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      
      throw createError; // Re-throw to be caught by outer catch
    }

    return NextResponse.json(
      {
        message: 'Candidate created successfully',
        candidate: {
          id: candidate._id,
          email: candidate.email,
          name: candidate.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create candidate',
        details: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          code: error.code,
          errors: error.errors,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

