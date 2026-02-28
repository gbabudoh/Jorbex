import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Verify candidate exists
    const candidateExists = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidateExists) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        senderType: 'EMPLOYER',
        senderEmployerId: session.user.id,
        receiverCandidateId: candidateId,
        content: content.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId: newMessage.id,
    }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
