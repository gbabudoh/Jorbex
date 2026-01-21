import axios from 'axios';
import NotificationLog from '@/models/NotificationLog';

const LISTMONK_URL = process.env.LISTMONK_URL;
const LISTMONK_API_USER = process.env.LISTMONK_API_USER;
const LISTMONK_API_PASSWORD = process.env.LISTMONK_API_PASSWORD;

// Template IDs (Synchronize these with your Listmonk setup)
export const TEMPLATE_IDS = {
  INTERVIEW_INVITE: 2,
  INTERVIEW_REMINDER: 3,
  INTERVIEW_CANCELLED: 4,
  APPLICATION_CONFIRMATION: 6,
};

interface SendEmailOptions {
  email: string;
  templateId: number;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  data: Record<string, any>; // Template variables
  userId?: string;
  userType?: 'candidate' | 'employer' | 'admin';
  subject?: string;
}

/**
 * Send Email via Listmonk (Transactional)
 */
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
        data: data,
        content_type: 'html'
      },
      {
        auth: {
          username: LISTMONK_API_USER,
          password: LISTMONK_API_PASSWORD,
        },
      }
    );

    if (userId && userType) {
      await NotificationLog.create({
        userId,
        userType,
        type: 'EMAIL',
        channel: 'EMAIL',
        email,
        subject: subject,
        content: JSON.stringify(data),
        status: 'SENT',
        sentAt: new Date(),
      });
    }

    return response.data;
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    console.error('Listmonk Error:', error.message);
    if (userId && userType) {
      await NotificationLog.create({
        userId,
        userType,
        type: 'EMAIL',
        channel: 'EMAIL',
        email,
        subject: subject,
        content: JSON.stringify(data),
        status: 'FAILED',
        error: error.message,
      });
    }
    throw error;
  }
}

// Helpers

export async function sendInterviewInvite(
  email: string,
  candidateName: string,
  companyName: string,
  position: string,
  date: Date,
  meetingUrl: string,
  interviewerName?: string
) {
  const formattedDate = date.toLocaleString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric', 
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return sendEmailNotification({
    email,
    templateId: TEMPLATE_IDS.INTERVIEW_INVITE,
    data: {
      candidate_name: candidateName,
      company_name: companyName,
      position: position,
      interview_date: formattedDate,
      meeting_url: meetingUrl,
      interviewer_name: interviewerName || 'Hiring Manager'
    },
    subject: `Interview Invitation: ${position} at ${companyName}`
  });
}

export async function sendInterviewReminder(
  email: string,
  candidateName: string,
  companyName: string,
  position: string,
  date: Date,
  meetingUrl: string,
  minutesUntil: number
) {
  return sendEmailNotification({
    email,
    templateId: TEMPLATE_IDS.INTERVIEW_REMINDER,
    data: {
      candidate_name: candidateName,
      company_name: companyName,
      position: position,
      minutes_until: minutesUntil,
      meeting_url: meetingUrl
    },
    subject: `Reminder: Interview in ${minutesUntil} minutes`
  });
}

export async function sendInterviewCancellation(
  email: string,
  candidateName: string,
  companyName: string,
  position: string,
  reason?: string
) {
  return sendEmailNotification({
    email,
    templateId: TEMPLATE_IDS.INTERVIEW_CANCELLED,
    data: {
      candidate_name: candidateName,
      company_name: companyName,
      position: position,
      reason: reason || 'Not specified'
    },
    subject: `Interview Cancelled: ${position} at ${companyName}`
  });
}

export async function sendApplicationConfirmation(
  email: string,
  candidateName: string,
  companyName: string,
  position: string,
  applicationId: string
) {
  return sendEmailNotification({
    email,
    templateId: TEMPLATE_IDS.APPLICATION_CONFIRMATION,
    data: {
      candidate_name: candidateName,
      company_name: companyName,
      position: position,
      application_id: applicationId
    },
    subject: `Application Received: ${position} at ${companyName}`
  });
}
