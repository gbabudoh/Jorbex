import axios from 'axios';
import prisma from '@/lib/prisma';
import { RoleType } from '@prisma/client';

const NTFY_URL = process.env.NTFY_URL;
const NTFY_TOKEN = process.env.NTFY_TOKEN;

interface SendPushOptions {
  topic: string;
  title: string;
  message: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  click?: string;
  userId?: string;
  userType?: 'candidate' | 'employer' | 'admin';
}

export async function sendPushNotification(options: SendPushOptions) {
  if (!NTFY_URL) {
    console.error('NTFY_URL is not defined');
    return;
  }

  const { topic, title, message, priority = 3, tags = [], click, userId, userType } = options;

  try {
    const response = await axios.post(
      `${NTFY_URL}/${topic}`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${NTFY_TOKEN}`,
          'Title': title,
          'Priority': priority.toString(),
          'Tags': tags.join(','),
          ...(click && { 'Click': click }),
        },
      }
    );

    if (userId && userType) {
      await prisma.notificationLog.create({
        data: {
          userType: userType.toUpperCase() as RoleType,
          ...(userType === 'employer' ? { employerId: userId } : { candidateId: userId }),
          type: 'PUSH',
          channel: 'PUSH',
          subject: title,
          content: message,
          status: 'SENT',
          sentAt: new Date(),
          referenceId: topic,
        },
      });
    }

    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Ntfy Error:', errorMessage);
    if (userId && userType) {
      await prisma.notificationLog.create({
        data: {
          userType: userType.toUpperCase() as RoleType,
          ...(userType === 'employer' ? { employerId: userId } : { candidateId: userId }),
          type: 'PUSH',
          channel: 'PUSH',
          subject: title,
          content: message,
          status: 'FAILED',
          error: errorMessage,
        },
      });
    }
    throw error;
  }
}
