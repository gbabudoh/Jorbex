import axios from 'axios';
import prisma from '@/lib/prisma';
import { RoleType } from '@prisma/client';

const LISTMONK_URL = process.env.LISTMONK_URL;
const LISTMONK_API_USER = process.env.LISTMONK_API_USER;
const LISTMONK_API_PASSWORD = process.env.LISTMONK_API_PASSWORD;

export const TEMPLATE_IDS = {
  INTERVIEW_INVITE: 2,
  INTERVIEW_INVITATION: 2,
  INTERVIEW_REMINDER: 3,
  INTERVIEW_CANCELLED: 4,
  APPLICATION_CONFIRMATION: 6,
};

interface SendEmailOptions {
  email: string;
  templateId: number;
  data: Record<string, unknown>;
  userId?: string;
  userType?: 'candidate' | 'employer' | 'admin';
  subject?: string;
}

export async function sendEmailNotification(options: SendEmailOptions) {
  if (!LISTMONK_URL || !LISTMONK_API_USER || !LISTMONK_API_PASSWORD) {
    console.error('Listmonk credentials are not defined');
    return;
  }

  const { email, templateId, data, userId, userType, subject = 'Notification' } = options;

  try {
    const response = await axios.post(
      `${LISTMONK_URL}/api/tx`,
      {
        subscriber_email: email,
        template_id: templateId,
        data,
        content_type: 'html',
      },
      {
        auth: { username: LISTMONK_API_USER, password: LISTMONK_API_PASSWORD },
      }
    );

    if (userId && userType) {
      await prisma.notificationLog.create({
        data: {
          userType: userType.toUpperCase() as RoleType,
          ...(userType === 'employer' ? { employerId: userId } : { candidateId: userId }),
          email,
          type: 'EMAIL',
          channel: 'EMAIL',
          subject,
          content: JSON.stringify(data),
          status: 'SENT',
          sentAt: new Date(),
        },
      });
    }

    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Listmonk Error:', errorMessage);
    if (userId && userType) {
      await prisma.notificationLog.create({
        data: {
          userType: userType.toUpperCase() as RoleType,
          ...(userType === 'employer' ? { employerId: userId } : { candidateId: userId }),
          email,
          type: 'EMAIL',
          channel: 'EMAIL',
          subject,
          content: JSON.stringify(data),
          status: 'FAILED',
          error: errorMessage,
        },
      });
    }
    throw error;
  }
}
