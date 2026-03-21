import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { onboardEmployee, type SupportedCountry } from '@/lib/frappe';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      offerId,
      dateOfBirth,
      gender,
      payrollCycle,
      // Nigeria-specific (optional)
      taxId,
      pencomNumber,
      // Kenya-specific (optional)
      kraPin,
      nhifNumber,
      nssfNumber,
    } = await req.json();

    if (!offerId) {
      return NextResponse.json({ error: 'offerId is required' }, { status: 400 });
    }

    // 1 — Load offer with employer + candidate
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        employer:  { select: { id: true, name: true, companyName: true, country: true } },
        candidate: { select: { id: true, name: true, email: true, phone: true, country: true } },
        job:       { select: { title: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    if (offer.employerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (offer.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'Offer must be accepted before EOR onboarding' }, { status: 400 });
    }
    if (offer.eorRequested) {
      return NextResponse.json({ error: 'EOR onboarding already initiated for this offer' }, { status: 409 });
    }

    const { employer, candidate } = offer;
    const country = (candidate.country || employer.country || 'NG').toUpperCase() as SupportedCountry;

    // Parse salary — offer.salary is stored as a string e.g. "5000"
    const grossSalary = parseFloat(offer.salary.replace(/[^0-9.]/g, '')) || 0;

    // Split candidate name into first/last
    const nameParts  = candidate.name.trim().split(' ');
    const firstName  = nameParts[0];
    const lastName   = nameParts.slice(1).join(' ') || undefined;

    // 2 — Create EmploymentRecord in DB first (status: PENDING)
    const employmentRecord = await prisma.employmentRecord.create({
      data: {
        offerId:      offer.id,
        employerId:   employer.id,
        candidateId:  candidate.id,
        country,
        grossSalary,
        currency:     offer.currency,
        payrollCycle: payrollCycle || 'monthly',
        startDate:    offer.startDate,
        status:       'PENDING',
      },
    });

    // 3 — Mark offer as EOR requested
    await prisma.offer.update({
      where: { id: offerId },
      data:  { eorRequested: true, eorStatus: 'pending' },
    });

    // 4 — Onboard in Frappe HR (non-blocking if Frappe not yet configured)
    let frappeEmployeeName: string | null = null;

    if (process.env.FRAPPE_HOST && process.env.FRAPPE_API_KEY && process.env.FRAPPE_API_SECRET) {
      try {
        frappeEmployeeName = await onboardEmployee({
          jorbexCandidateId:  candidate.id,
          firstName,
          lastName,
          email:              candidate.email,
          phone:              candidate.phone ?? undefined,
          dateOfBirth:        dateOfBirth || '1990-01-01',
          gender:             gender || 'Male',
          startDate:          offer.startDate.toISOString().split('T')[0],
          country,
          grossMonthlySalary: grossSalary,
          currency:           offer.currency,
          designation:        offer.job?.title,
          taxId,
          pencomNumber,
          kraPin,
          nhifNumber,
          nssfNumber,
        });

        // Update record + offer with Frappe employee name
        await prisma.employmentRecord.update({
          where: { id: employmentRecord.id },
          data:  { frappeEmployeeName, status: 'ONBOARDING' },
        });
        await prisma.offer.update({
          where: { id: offerId },
          data:  { eorContractId: frappeEmployeeName, eorStatus: 'onboarding' },
        });
      } catch (frappeErr) {
        console.error('[EOR] Frappe onboarding failed:', frappeErr);
        // Record stays in PENDING — can retry from compliance dashboard
      }
    }

    return NextResponse.json({
      success:            true,
      employmentRecordId: employmentRecord.id,
      frappeEmployeeName,
      status:             frappeEmployeeName ? 'ONBOARDING' : 'PENDING',
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('[EOR] onboard error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
