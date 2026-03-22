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
    const { name, email, password, phone, companyName, termsAccepted, privacyAccepted, marketingConsent } = body;

    if (!name || !email || !password || !phone || !companyName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!termsAccepted || !privacyAccepted) {
      return NextResponse.json(
        { error: 'You must accept the Terms of Service and Privacy Policy to register' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.employer.findUnique({
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
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const employer = await prisma.employer.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone.trim(),
        companyName: companyName.trim(),
        subscriptionStatus: 'TRIAL',
        subscriptionStartDate: now,
        subscriptionEndDate: trialEndDate,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        marketingConsent: !!marketingConsent,
        consentIp,
      },
    });

    return NextResponse.json(
      {
        message: 'Employer created successfully',
        employer: {
          id: employer.id,
          email: employer.email,
          name: employer.name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create employer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
