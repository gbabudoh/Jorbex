import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if candidate already exists
    const existing = await prisma.candidate.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const candidate = await prisma.candidate.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone.trim(),
        expertise,
        skills: [],
        onboardingTestPassed: false,
      },
    });

    return NextResponse.json(
      {
        message: 'Candidate created successfully',
        candidate: {
          id: candidate.id,
          email: candidate.email,
          name: candidate.name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create candidate';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
