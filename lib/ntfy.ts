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
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    console.error('Ntfy Error:', error.message);
    if (userId && userType) {
      await NotificationLog.create({
        userId,
        userType,
        type: 'PUSH',
        channel: 'PUSH',
        subject: title,
        content: message,
        status: 'FAILED',
        error: error.message,
      });
    }
    throw error;
  }
}

// Specific Notification Helpers

export async function notifyInterviewScheduled(
  candidateId: string,
  companyName: string,
  position: string,
  date: Date,
  meetingUrl: string
) {
  // Assuming topic is derived from candidate ID for now, or stored in user
  // In a real app we'd fetch the user's topic. For now using a convention.
  const topic = `user_${candidateId}`; 
  const formattedDate = date.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });

  return sendPushNotification({
    topic,
    title: '📅 Interview Scheduled',
    message: `Interview with ${companyName} for ${position} on ${formattedDate}.`,
    priority: 4,
    tags: ['calendar', 'briefcase'],
    click: meetingUrl,
    userId: candidateId,
    userType: 'candidate'
  });
}

export async function notifyInterviewReminder(
  candidateId: string,
  companyName: string,
  position: string,
  minutesUntil: number,
  meetingUrl: string
) {
  const topic = `user_${candidateId}`;
  return sendPushNotification({
    topic,
    title: `⏰ Interview in ${minutesUntil} mins`,
    message: `Prepare for your ${position} interview with ${companyName}.`,
    priority: 5, // High priority
    tags: ['alarm_clock', 'video_camera'],
    click: meetingUrl,
    userId: candidateId,
    userType: 'candidate'
  });
}

export async function notifyInterviewCancelled(
  candidateId: string,
  companyName: string,
  position: string,
  reason?: string
) {
  const topic = `user_${candidateId}`;
  return sendPushNotification({
    topic,
    title: '❌ Interview Cancelled',
    message: `${companyName} cancelled the interview for ${position}. Reason: ${reason || 'Not specified'}`,
    priority: 4,
    tags: ['x', 'warning'],
    userId: candidateId,
    userType: 'candidate'
  });
}

export async function notifyInterviewRescheduled(
  candidateId: string,
  companyName: string,
  position: string,
  newDate: Date,
  meetingUrl: string
) {
  const topic = `user_${candidateId}`;
  const formattedDate = newDate.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  
  return sendPushNotification({
    topic,
    title: '🔄 Interview Rescheduled',
    message: `New time: ${formattedDate} for ${position} at ${companyName}.`,
    priority: 4,
    tags: ['rotating_light', 'calendar'],
    click: meetingUrl,
    userId: candidateId,
    userType: 'candidate'
  });
}

export async function notifyEmployerNewApplication(
  employerId: string,
  candidateName: string,
  position: string,
  applicationUrl: string
) {
  const topic = `emp_${employerId}`;
  return sendPushNotification({
    topic,
    title: '📥 New Application',
    message: `${candidateName} applied for ${position}.`,
    priority: 3,
    tags: ['inbox_tray', 'star'],
    click: applicationUrl,
    userId: employerId,
    userType: 'employer'
  });
}
