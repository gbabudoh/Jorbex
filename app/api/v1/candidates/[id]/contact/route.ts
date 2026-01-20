import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import Candidate from '@/models/Candidate';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify candidate exists
    const candidateExists = await Candidate.findById(candidateId);
    if (!candidateExists) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Create the message
    const newMessage = new Message({
      senderId: session.user.id,
      receiverId: candidateId,
      senderType: 'employer',
      content: content.trim(),
    });

    await newMessage.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: newMessage._id 
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
