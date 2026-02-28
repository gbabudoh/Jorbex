import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: session.user.id },
      include: { workHistory: true, references: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const { password: _, ...profile } = candidate;
    return NextResponse.json(profile, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, phone, expertise, country, city, personalStatement, skills,
      workHistory, references, highestQualification, university,
      degree, professionalQualifications, hobbies,
    } = body;

    // Update scalar fields
    const candidate = await prisma.candidate.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(expertise && { expertise }),
        ...(country !== undefined && { country }),
        ...(city !== undefined && { city }),
        ...(personalStatement !== undefined && { personalStatement }),
        ...(skills && { skills }),
        ...(highestQualification !== undefined && { highestQualification }),
        ...(university !== undefined && { university }),
        ...(degree !== undefined && { degree }),
        ...(professionalQualifications !== undefined && { professionalQualifications }),
        ...(hobbies !== undefined && { hobbies }),
      },
      include: { workHistory: true, references: true },
    });

    // Replace work history if provided
    if (workHistory) {
      await prisma.workHistory.deleteMany({ where: { candidateId: session.user.id } });
      if (workHistory.length > 0) {
        await prisma.workHistory.createMany({
          data: workHistory.map((w: { company: string; position: string; startDate: string; endDate?: string; description: string }) => ({
            candidateId: session.user.id,
            company: w.company,
            position: w.position,
            startDate: new Date(w.startDate),
            endDate: w.endDate ? new Date(w.endDate) : null,
            description: w.description || '',
          })),
        });
      }
    }

    // Replace references if provided
    if (references) {
      await prisma.reference.deleteMany({ where: { candidateId: session.user.id } });
      if (references.length > 0) {
        await prisma.reference.createMany({
          data: references.map((r: { name: string; email: string; phone: string; relationship: string }) => ({
            candidateId: session.user.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            relationship: r.relationship,
          })),
        });
      }
    }

    const { password: _, ...profile } = candidate;
    return NextResponse.json(profile, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}
