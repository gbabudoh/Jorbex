import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');

    if (!employerId) {
      return NextResponse.json({ error: 'Missing employerId' }, { status: 400 });
    }

    const channels = await prisma.mattermostChannel.findMany({
      where: { employerId },
    });

    return NextResponse.json({ channels });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch channels';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
