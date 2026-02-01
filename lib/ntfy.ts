import axios from 'axios';
import NotificationLog from '@/models/NotificationLog';

const NTFY_URL = process.env.NTFY_URL;
const NTFY_TOKEN = process.env.NTFY_TOKEN;

interface SendPushOptions {
  topic: string;
  title: string;
  message: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  click?: string; // Action URL
  userId?: string; // For logging
  userType?: 'candidate' | 'employer' | 'admin';
}

/**
 * Send Push Notification via Ntfy
 */
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
      await NotificationLog.create({
        userId,
        userType,
        type: 'PUSH',
        channel: 'PUSH',
        subject: title,
        content: message,
        status: 'SENT',
        sentAt: new Date(),
        referenceId: topic,
      });
    }

    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Ntfy Error:', errorMessage);
    if (userId && userType) {
      await NotificationLog.create({
        userId,
        userType,
        type: 'PUSH',
        channel: 'PUSH',
        subject: title,
        content: message,
        status: 'FAILED',
        error: errorMessage,
      });
    }
    throw error;
  }
}

// Specific Notification Helpers

// End of helpers
