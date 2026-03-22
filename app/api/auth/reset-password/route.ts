import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { rateLimit, getIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // 10 attempts per IP per 15 minutes
  if (!rateLimit(`reset:${getIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { token, password, userType } = body;

  if (!token || !password || !['candidate', 'employer'].includes(userType)) {
    return NextResponse.json(
      { error: 'Token, password, and valid user type are required.' },
      { status: 400 }
    );
  }

  if (String(password).length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 }
    );
  }

  const now = new Date();

  try {
    if (userType === 'candidate') {
      const user = await prisma.candidate.findFirst({
        where: { passwordResetToken: token, passwordResetExpiry: { gt: now } },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json(
          { error: 'This reset link is invalid or has expired.' },
          { status: 400 }
        );
      }
      await prisma.candidate.update({
        where: { id: user.id },
        data: {
          password: await hash(password, 12),
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      });
    } else {
      const user = await prisma.employer.findFirst({
        where: { passwordResetToken: token, passwordResetExpiry: { gt: now } },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json(
          { error: 'This reset link is invalid or has expired.' },
          { status: 400 }
        );
      }
      await prisma.employer.update({
        where: { id: user.id },
        data: {
          password: await hash(password, 12),
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      });
    }

    return NextResponse.json({
      message: 'Password updated successfully. You can now log in.',
    });
  } catch (err) {
    console.error('[reset-password]', err);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
