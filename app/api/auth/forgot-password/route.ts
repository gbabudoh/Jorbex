import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createTransport } from 'nodemailer';
import prisma from '@/lib/prisma';
import { rateLimit, getIp } from '@/lib/rateLimit';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  // 5 requests per IP per 15 minutes
  if (!rateLimit(`forgot:${getIp(request)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { email, userType } = body;

  if (!email || !['candidate', 'employer'].includes(userType)) {
    return NextResponse.json(
      { error: 'Valid email and user type (candidate or employer) are required.' },
      { status: 400 }
    );
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const token = randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  try {
    if (userType === 'candidate') {
      const user = await prisma.candidate.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, name: true },
      });
      if (user) {
        await prisma.candidate.update({
          where: { id: user.id },
          data: { passwordResetToken: token, passwordResetExpiry: expiry },
        });
        await sendResetEmail(normalizedEmail, user.name, token, 'candidate');
      }
    } else {
      const user = await prisma.employer.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, name: true },
      });
      if (user) {
        await prisma.employer.update({
          where: { id: user.id },
          data: { passwordResetToken: token, passwordResetExpiry: expiry },
        });
        await sendResetEmail(normalizedEmail, user.name, token, 'employer');
      }
    }
  } catch (err) {
    console.error('[forgot-password]', err);
    // Don't expose DB errors — fall through to success response
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({
    message: 'If an account with that email exists, a reset link has been sent.',
  });
}

async function sendResetEmail(
  email: string,
  name: string,
  token: string,
  userType: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://jorbex.com';
  const resetUrl = `${baseUrl}/reset-password?token=${token}&type=${userType}`;

  await transporter.sendMail({
    from: `"Jorbex" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Reset your Jorbex password',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="width:56px;height:56px;background:linear-gradient(135deg,#0066FF,#00D9A5);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;">
            <span style="color:white;font-weight:700;font-size:22px;">J</span>
          </div>
        </div>
        <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px;">Reset your password</h2>
        <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 28px;">
          Hi ${name}, we received a request to reset your Jorbex password.
          Click the button below to choose a new one.
        </p>
        <a href="${resetUrl}"
           style="display:block;background:linear-gradient(135deg,#0066FF,#00D9A5);color:white;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px;margin-bottom:28px;">
          Reset Password
        </a>
        <p style="color:#9CA3AF;font-size:13px;line-height:1.5;margin:0 0 8px;">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color:#D1D5DB;font-size:12px;word-break:break-all;">
          ${resetUrl}
        </p>
        <hr style="border:none;border-top:1px solid #F3F4F6;margin:28px 0 16px;" />
        <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0;">
          © ${new Date().getFullYear()} Jorbex · Africa's Talent Platform
        </p>
      </div>
    `,
  });
}
