import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, companyName } = body;

    if (!name || !email || !password || !phone || !companyName) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
        subscriptionStartDate: new Date(),
        subscriptionEndDate: trialEndDate,
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
