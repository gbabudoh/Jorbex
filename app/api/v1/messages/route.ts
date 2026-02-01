import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
// Ensured models are registered
import '@/models/Employer';
import '@/models/Candidate';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'inbox';
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    let query = {};
    if (type === 'sent') {
      query = { 
        senderId: session.user.id,
        deletedBySender: { $ne: true }
      };
    } else {
      query = { 
        receiverId: session.user.id,
        deletedByReceiver: { $ne: true }
      };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name companyName')
      .populate('receiverId', 'name companyName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ messages }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await Message.findOneAndUpdate(
      { _id: messageId, receiverId: session.user.id },
      { isRead: true },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Message not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: result }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { receiverId, content } = await request.json();

    if (!receiverId || !content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newMessage = new Message({
      senderId: session.user.id,
      receiverId,
      senderType: session.user.userType,
      content: content.trim(),
    });

    await newMessage.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      data: newMessage 
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Determine if user is sender or receiver and mark accordingly
    if (message.senderId.toString() === session.user.id) {
      message.deletedBySender = true;
    } else if (message.receiverId.toString() === session.user.id) {
      message.deletedByReceiver = true;
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If both marked as deleted, we could hard delete, but soft delete is safer
    await message.save();

    return NextResponse.json({ success: true, message: 'Message deleted' }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
