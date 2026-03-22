import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // 10 signups per IP per hour
  if (!rateLimit(`signup:${getIp(request)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password, phone, expertise, termsAccepted, privacyAccepted, marketingConsent } = body;

    if (!name || !email || !password || !phone || !expertise) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!termsAccepted || !privacyAccepted) {
      return NextResponse.json(
        { error: 'You must accept the Terms of Service and Privacy Policy to register' },
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
    const consentIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const now = new Date();

    const candidate = await prisma.candidate.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone.trim(),
        expertise,
        skills: [],
        onboardingTestPassed: false,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        marketingConsent: !!marketingConsent,
        consentIp,
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
