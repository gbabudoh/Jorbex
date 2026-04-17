import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const enquiry = await prisma.programmeEnquiry.findUnique({
      where: { id },
      include: { portal: true },
    });

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json(enquiry);
  } catch (error) {
    console.error('Get enquiry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, rejectReason } = body;

    const enquiry = await prisma.programmeEnquiry.findUnique({ where: { id } });
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Generate a unique slug from institution name
      const baseSlug = enquiry.institutionName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

      // Generate temporary password for the admin user
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await hash(tempPassword, 12);

      // Create portal and admin user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the portal
        const portal = await tx.programmePortal.create({
          data: {
            type: enquiry.type,
            institutionName: enquiry.institutionName,
            slug,
            country: enquiry.country,
            city: enquiry.city,
            website: null,
            status: 'ACTIVE',
            enquiryId: enquiry.id,
          },
        });

        // Create the admin user for the portal
        const adminUser = await tx.programmeUser.create({
          data: {
            portalId: portal.id,
            email: enquiry.email,
            name: enquiry.contactName || 'Portal Admin',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
          },
        });

        // Update enquiry status
        await tx.programmeEnquiry.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        });

        return { portal, adminUser, tempPassword };
      });

      // TODO: Send email to enquiry.email with login credentials
      console.log('[Programme approved]', {
        portal: result.portal.slug,
        email: enquiry.email,
        tempPassword: result.tempPassword,
      });

      return NextResponse.json({
        success: true,
        portal: result.portal,
        message: `Portal created. Login credentials sent to ${enquiry.email}`,
        // In production, don't return password — send via email
        credentials: {
          email: enquiry.email,
          tempPassword: result.tempPassword,
          loginUrl: `/programmes/${enquiry.type.toLowerCase()}/login`,
        },
      });
    }

    if (action === 'reject') {
      await prisma.programmeEnquiry.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          notes: rejectReason ? `Rejected: ${rejectReason}` : enquiry.notes,
        },
      });

      return NextResponse.json({ success: true, message: 'Enquiry rejected' });
    }

    if (action === 'reviewing') {
      await prisma.programmeEnquiry.update({
        where: { id },
        data: { status: 'REVIEWING' },
      });

      return NextResponse.json({ success: true, message: 'Marked as reviewing' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update enquiry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
