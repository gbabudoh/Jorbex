import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'inbox';
    const userType = session.user.userType;
    const userId = session.user.id;

    const isEmployer = userType === 'employer';

    let where = {};
    if (type === 'sent') {
      where = isEmployer
        ? { senderEmployerId: userId, deletedBySender: false }
        : { senderCandidateId: userId, deletedBySender: false };
    } else {
      where = isEmployer
        ? { receiverEmployerId: userId, deletedByReceiver: false }
        : { receiverCandidateId: userId, deletedByReceiver: false };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        senderEmployer: { select: { id: true, name: true, companyName: true } },
        senderCandidate: { select: { id: true, name: true } },
        receiverEmployer: { select: { id: true, name: true, companyName: true } },
        receiverCandidate: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const isEmployer = session.user.userType === 'employer';
    const receiverField = isEmployer ? 'receiverEmployerId' : 'receiverCandidateId';

    const message = await prisma.message.updateMany({
      where: { id: messageId, [receiverField]: session.user.id },
      data: { isRead: true },
    });

    if (message.count === 0) {
      return NextResponse.json({ error: 'Message not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, receiverType, content } = await request.json();
    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'Receiver ID and content are required' }, { status: 400 });
    }

    const isEmployer = session.user.userType === 'employer';
    const targetIsEmployer = receiverType === 'employer';

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderType: isEmployer ? 'EMPLOYER' : 'CANDIDATE',
        ...(isEmployer ? { senderEmployerId: session.user.id } : { senderCandidateId: session.user.id }),
        ...(targetIsEmployer ? { receiverEmployerId: receiverId } : { receiverCandidateId: receiverId }),
      },
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully', data: message }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const userId = session.user.id;
    const isSender = message.senderEmployerId === userId || message.senderCandidateId === userId;
    const isReceiver = message.receiverEmployerId === userId || message.receiverCandidateId === userId;

    if (!isSender && !isReceiver) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        ...(isSender && { deletedBySender: true }),
        ...(isReceiver && { deletedByReceiver: true }),
      },
    });

    return NextResponse.json({ success: true, message: 'Message deleted' }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
