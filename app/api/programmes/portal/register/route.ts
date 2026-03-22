import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

async function sendEmails(params: {
  registrantEmail: string;
  registrantName: string;
  institutionName: string;
  type: string;
  portalStatus: string;
  portalSlug: string;
}) {
  const { registrantEmail, registrantName, institutionName, type, portalStatus, portalSlug } = params;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const fromAddress = process.env.SMTP_FROM || 'noreply@jorbex.com';

  // Notification to programmes team
  await transporter.sendMail({
    from: fromAddress,
    to: 'programmes@jorbex.com',
    subject: `New ${type} Portal Registration — ${institutionName}`,
    html: `
      <h2>New Programme Portal Registration</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Institution:</strong> ${institutionName}</p>
      <p><strong>Registrant:</strong> ${registrantName} (${registrantEmail})</p>
      <p><strong>Portal Slug:</strong> ${portalSlug}</p>
      <p><strong>Status:</strong> ${portalStatus}</p>
      <p>Please review in the admin panel.</p>
    `,
  });

  // Confirmation to registrant
  const isPending = portalStatus === 'PENDING';
  await transporter.sendMail({
    from: fromAddress,
    to: registrantEmail,
    subject: isPending
      ? `Your Jorbex University Portal is Pending Approval — ${institutionName}`
      : `Your Jorbex Corporate Portal is Active — ${institutionName}`,
    html: isPending
      ? `
        <h2>Thank you for registering, ${registrantName}!</h2>
        <p>Your university portal for <strong>${institutionName}</strong> has been submitted and is currently <strong>pending approval</strong>.</p>
        <p>Our team will review your application and contact you at this email within <strong>2 business days</strong>.</p>
        <p>Your portal slug: <strong>${portalSlug}</strong></p>
        <p>Questions? Email <a href="mailto:programmes@jorbex.com">programmes@jorbex.com</a></p>
      `
      : `
        <h2>Welcome to Jorbex, ${registrantName}!</h2>
        <p>Your corporate portal for <strong>${institutionName}</strong> is now <strong>ACTIVE</strong>.</p>
        <p>Sign in at: <a href="https://jorbex.com/programmes/corporate/login">https://jorbex.com/programmes/corporate/login</a></p>
        <p>Your portal slug: <strong>${portalSlug}</strong></p>
        <p>Questions? Email <a href="mailto:programmes@jorbex.com">programmes@jorbex.com</a></p>
      `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, institutionName, country, city, website, name, email, password, phone } = body;

    // Validate required fields
    if (!type || !institutionName || !country || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: type, institutionName, country, name, email, password' },
        { status: 400 }
      );
    }

    if (!['UNIVERSITY', 'CORPORATE'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be UNIVERSITY or CORPORATE' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if ProgrammeUser email already exists
    const existingUser = await prisma.programmeUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);
    const slug = generateSlug(institutionName);
    const portalStatus = type === 'CORPORATE' ? 'ACTIVE' : 'PENDING';

    // Create portal and owner user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const portal = await tx.programmePortal.create({
        data: {
          type,
          institutionName,
          country,
          city: city || null,
          slug,
          status: portalStatus,
          subscriptionStatus: 'TRIAL',
        },
      });

      const portalUser = await tx.programmeUser.create({
        data: {
          portalId: portal.id,
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: 'OWNER',
          isActive: type === 'CORPORATE', // active immediately for corporate, pending for university
        },
      });

      return { portal, portalUser };
    });

    // Send emails (non-blocking — don't let email failure break the registration)
    try {
      await sendEmails({
        registrantEmail: normalizedEmail,
        registrantName: name,
        institutionName,
        type,
        portalStatus,
        portalSlug: slug,
      });
    } catch (emailError) {
      console.error('Email sending failed (non-fatal):', emailError);
    }

    return NextResponse.json({
      success: true,
      portalStatus,
      portalSlug: slug,
    });
  } catch (error) {
    console.error('Portal registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
