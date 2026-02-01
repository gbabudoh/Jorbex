// Combined notification service for email + push + internal (Mattermost)

// Mattermost imports

import {
  sendEmailNotification,
  TEMPLATE_IDS
} from './listmonk';

import { createInterviewMeeting, InterviewMeeting } from './jitsi';
import NotificationPreference from '@/models/NotificationPreference';
import dbConnect from './dbConnect';

import {
  sendMessage,
  notifyInterviewScheduled as mattermostInterviewScheduled,
  notifyInterviewCompleted as mattermostInterviewCompleted,
  notifyCandidateHired as mattermostCandidateHired,
  notifyNewApplication as mattermostNewApplication,
  notifyNewEmployerSignup as mattermostNewEmployerSignup,
} from './mattermost';

export { TEMPLATE_IDS } from './listmonk';
import { sendPushNotification } from './ntfy';

// ============================================
// Mattermost Channel IDs (configure these)
// ============================================

const MATTERMOST_CHANNELS = {
  INTERVIEWS: process.env.MATTERMOST_CHANNEL_INTERVIEWS || '',
  HIRING: process.env.MATTERMOST_CHANNEL_HIRING || '',
  SALES: process.env.MATTERMOST_CHANNEL_SALES || '',
  SUPPORT: process.env.MATTERMOST_CHANNEL_SUPPORT || '',
  DEV_ALERTS: process.env.MATTERMOST_CHANNEL_DEV_ALERTS || '',
  MANAGEMENT: process.env.MATTERMOST_CHANNEL_MANAGEMENT || '',
};

// ============================================
// Types
// ============================================

export interface ScheduleInterviewParams {
  interviewId: string;
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
  employerId: string;
  employerEmail: string;
  employerName: string;
  companyName: string;
  position: string;
  interviewDate: Date;
  interviewerName?: string;
}

export interface NotificationUser {
  _id?: string | { toString(): string };
  email?: string;
  ntfyTopic?: string;
  userType?: 'candidate' | 'employer' | 'admin';
}

export interface InterviewResult extends InterviewMeeting {
  interviewId: string;
  emailSent: boolean;
  pushSent: boolean;
  mattermostSent: boolean;
}

// ============================================
// Interview Scheduling
// ============================================

export async function scheduleInterview({
  interviewId,
  candidateId,
  candidateEmail,
  candidateName,
  employerName,
  companyName,
  position,
  interviewDate,
  interviewerName,
}: ScheduleInterviewParams): Promise<InterviewResult> {
  // Generate meeting URLs
  const meeting = createInterviewMeeting(interviewId, candidateName, employerName);

  let emailSent = false;
  let pushSent = false;
  let mattermostSent = false;

  const formattedDate = interviewDate.toLocaleString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric', 
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // 1. Notify Candidate via sendNotification (handles Preferences)
  const results = await sendNotification(
    { _id: candidateId, email: candidateEmail, userType: 'candidate' },
    {
      title: 'Interview Scheduled',
      message: `An interview with ${companyName} for ${position} has been scheduled for ${formattedDate}.`,
      emailTemplateId: TEMPLATE_IDS.INTERVIEW_INVITATION,
      emailData: {
        candidate_name: candidateName,
        company_name: companyName,
        position: position,
        interview_date: formattedDate,
        meeting_url: meeting.candidateUrl,
        interviewer_name: interviewerName || employerName
      },
      type: 'interviews',
      actionUrl: meeting.candidateUrl,
      priority: 4,
      tags: ['calendar', 'briefcase'],
    }
  );

  // Map results (order: email then push if both enabled)
  // This mapping is simplified as it depends on enabled channels
  emailSent = results.some(r => r.status === 'fulfilled'); 
  pushSent = results.some(r => r.status === 'fulfilled');

  // 2. Send internal Mattermost notification
  try {
    if (MATTERMOST_CHANNELS.INTERVIEWS) {
      await mattermostInterviewScheduled(
        MATTERMOST_CHANNELS.INTERVIEWS,
        candidateName,
        position,
        interviewDate,
        interviewerName || employerName,
        meeting.meetingUrl
      );
      mattermostSent = true;
    }
  } catch (error) {
    console.error('Failed to send Mattermost notification:', error);
  }

  return {
    interviewId,
    ...meeting,
    emailSent,
    pushSent,
    mattermostSent,
  };
}

// ============================================
// Interview Reminders
// ============================================

export async function sendInterviewReminders(
  candidateId: string,
  candidateEmail: string,
  candidateName: string,
  companyName: string,
  position: string,
  interviewDate: Date,
  meetingUrl: string,
  minutesUntil: number
): Promise<{ emailSent: boolean; pushSent: boolean }> {
  const results = await sendNotification(
    { _id: candidateId, email: candidateEmail, userType: 'candidate' },
    {
      title: `Interview in ${minutesUntil} mins`,
      message: `Prepare for your ${position} interview with ${companyName}.`,
      emailTemplateId: TEMPLATE_IDS.INTERVIEW_REMINDER,
      emailData: {
        candidate_name: candidateName,
        company_name: companyName,
        position: position,
        minutes_until: minutesUntil,
        meeting_url: meetingUrl
      },
      type: 'interviews',
      actionUrl: meetingUrl,
      priority: 5,
      tags: ['alarm_clock', 'video_camera'],
    }
  );

  return {
    emailSent: results.some(r => r.status === 'fulfilled'),
    pushSent: results.some(r => r.status === 'fulfilled'),
  };
}

// ============================================
// Interview Cancellation
// ============================================

export async function cancelInterview(
  candidateId: string,
  candidateEmail: string,
  candidateName: string,
  companyName: string,
  position: string,
  reason?: string
): Promise<{ emailSent: boolean; pushSent: boolean; mattermostSent: boolean }> {
  let mattermostSent = false;

  const results = await sendNotification(
    { _id: candidateId, email: candidateEmail, userType: 'candidate' },
    {
      title: 'Interview Cancelled',
      message: `${companyName} cancelled the interview for ${position}. Reason: ${reason || 'Not specified'}`,
      emailTemplateId: TEMPLATE_IDS.INTERVIEW_CANCELLED,
      emailData: {
        candidate_name: candidateName,
        company_name: companyName,
        position: position,
        reason: reason || 'Not specified'
      },
      type: 'interviews',
      priority: 4,
      tags: ['x', 'warning'],
    }
  );

  // Send internal Mattermost notification
  try {
    if (MATTERMOST_CHANNELS.INTERVIEWS) {
      await sendMessage(
        MATTERMOST_CHANNELS.INTERVIEWS,
        `❌ **Interview Cancelled**\n\n**Candidate:** ${candidateName}\n**Position:** ${position} at ${companyName}\n**Reason:** ${reason || 'Not specified'}`
      );
      mattermostSent = true;
    }
  } catch (error) {
    console.error('Failed to send Mattermost cancellation notification:', error);
  }

  return { 
    emailSent: results.some(r => r.status === 'fulfilled'), 
    pushSent: results.some(r => r.status === 'fulfilled'), 
    mattermostSent 
  };
}

// ============================================
// Interview Rescheduling
// ============================================

export async function rescheduleInterview(
  interviewId: string,
  candidateId: string,
  candidateEmail: string,
  candidateName: string,
  companyName: string,
  position: string,
  newDate: Date,
  interviewerName?: string
): Promise<InterviewResult> {
  // Generate new meeting URLs
  const meeting = createInterviewMeeting(interviewId, candidateName, 'Employer');

  let mattermostSent = false;

  const formattedDate = newDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const results = await sendNotification(
    { _id: candidateId, email: candidateEmail, userType: 'candidate' },
    {
      title: 'Interview Rescheduled',
      message: `New time: ${formattedDate} for ${position} at ${companyName}.`,
      emailTemplateId: TEMPLATE_IDS.INTERVIEW_INVITATION,
      emailData: {
        candidate_name: candidateName,
        company_name: companyName,
        position: position,
        interview_date: formattedDate,
        meeting_url: meeting.candidateUrl,
        interviewer_name: interviewerName || 'Hiring Manager'
      },
      type: 'interviews',
      actionUrl: meeting.candidateUrl,
      priority: 4,
      tags: ['rotating_light', 'calendar'],
    }
  );

  // Send internal Mattermost notification
  try {
    if (MATTERMOST_CHANNELS.INTERVIEWS) {
      await sendMessage(
        MATTERMOST_CHANNELS.INTERVIEWS,
        `🔄 **Interview Rescheduled**\n\n**Candidate:** ${candidateName}\n**Position:** ${position} at ${companyName}\n**New Date:** ${formattedDate}\n**Interviewer:** ${interviewerName || 'TBD'}`
      );
      mattermostSent = true;
    }
  } catch (error) {
    console.error('Failed to send Mattermost reschedule notification:', error);
  }

  return {
    interviewId,
    ...meeting,
    emailSent: results.some(r => r.status === 'fulfilled'),
    pushSent: results.some(r => r.status === 'fulfilled'),
    mattermostSent,
  };
}

// ============================================
// Application Notifications
// ============================================

export async function notifyNewApplication(
  candidateId: string,
  candidateEmail: string,
  candidateName: string,
  employerId: string,
  companyName: string,
  position: string,
  applicationId: string,
  applicationUrl: string
): Promise<{ candidateEmailSent: boolean; employerPushSent: boolean; mattermostSent: boolean }> {
  let mattermostSent = false;

  // 1. Notify Candidate (Email confirmation)
  const candidateResults = await sendNotification(
    { _id: candidateId, email: candidateEmail, userType: 'candidate' },
    {
      title: 'Application Received',
      message: `Your application for ${position} at ${companyName} has been received.`,
      emailTemplateId: TEMPLATE_IDS.APPLICATION_CONFIRMATION,
      emailData: {
        candidate_name: candidateName,
        company_name: companyName,
        position: position,
        application_id: applicationId
      },
      type: 'applications',
      priority: 3,
    }
  );

  // 2. Notify Employer (Push notification)
  const employerResults = await sendNotification(
    { _id: employerId, userType: 'employer' },
    {
      title: '📥 New Application',
      message: `${candidateName} applied for ${position}.`,
      type: 'applications',
      actionUrl: applicationUrl,
      priority: 3,
      tags: ['inbox_tray', 'star'],
    }
  );

  // Send internal Mattermost notification
  try {
    if (MATTERMOST_CHANNELS.HIRING) {
      await mattermostNewApplication(
        MATTERMOST_CHANNELS.HIRING,
        candidateName,
        position,
        applicationUrl
      );
      mattermostSent = true;
    }
  } catch (error) {
    console.error('Failed to send Mattermost application notification:', error);
  }

  return { 
    candidateEmailSent: candidateResults.some(r => r.status === 'fulfilled'), 
    employerPushSent: employerResults.some(r => r.status === 'fulfilled'), 
    mattermostSent 
  };
}

// ============================================
// Interview Completion (Internal Only)
// ============================================

export async function notifyInterviewCompleted(
  candidateName: string,
  companyName: string,
  position: string,
  interviewerName: string,
  rating?: number,
  feedback?: string
): Promise<{ mattermostSent: boolean }> {
  let mattermostSent = false;

  try {
    if (MATTERMOST_CHANNELS.INTERVIEWS) {
      await mattermostInterviewCompleted(
        MATTERMOST_CHANNELS.INTERVIEWS,
        candidateName,
        position,
        interviewerName,
        rating,
        feedback
      );
      mattermostSent = true;
    }
  } catch (error) {
    console.error('Failed to send Mattermost completion notification:', error);
  }

  return { mattermostSent };
}

// ============================================
// Candidate Hired (Internal Only)
// ============================================

export async function notifyCandidateHired(
  candidateName: string,
  companyName: string,
  position: string
): Promise<{ mattermostSent: boolean }> {
  let mattermostSent = false;

  try {
    if (MATTERMOST_CHANNELS.HIRING) {
      await mattermostCandidateHired(
        MATTERMOST_CHANNELS.HIRING,
        candidateName,
        position
      );
      mattermostSent = true;
    }
  } catch (error) {
    console.error('Failed to send Mattermost hired notification:', error);
  }

  return { mattermostSent };
}

// ============================================
// System Alerts (Internal Only)
// ============================================

export async function sendSystemAlert(
  message: string,
  severity: 'info' | 'warning' | 'error' = 'info'
): Promise<{ mattermostSent: boolean }> {
  let mattermostSent = false;

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
  };

  try {
    if (MATTERMOST_CHANNELS.DEV_ALERTS) {
      await sendMessage(
        MATTERMOST_CHANNELS.DEV_ALERTS,
        `${icons[severity]} **System Alert**\n\n${message}`
      );
      mattermostSent = true;
    }
  } catch (error) {
    console.error('Failed to send system alert:', error);
  }

  return { mattermostSent };
}

// ============================================
// New Employer Signup (Sales Team)
// ============================================

export async function notifyNewEmployerSignup(
  companyName: string,
  contactName: string,
  contactEmail: string,
  companySize?: string
): Promise<{ mattermostSent: boolean }> {
  let mattermostSent = false;

  try {
    if (MATTERMOST_CHANNELS.SALES) {
      await mattermostNewEmployerSignup(
        MATTERMOST_CHANNELS.SALES,
        companyName,
        contactName,
        contactEmail,
        companySize
      );
      mattermostSent = true;
    }
  } catch (error) {
    console.error('Failed to send employer signup notification:', error);
  }

  return { mattermostSent };
}

// ============================================
// Generic Notification Utility
// ============================================

export interface NotificationOptions {
  title: string;
  message: string;
  emailTemplateId?: number;
  emailData?: Record<string, unknown>;
  type: 'messages' | 'applications' | 'interviews' | 'tests';
  actionUrl?: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

/**
 * Generic notification function used across the app (Email + Push)
 * Enforces user preferences.
 */
export async function sendNotification(user: NotificationUser, options: NotificationOptions) {
  const userId = user._id?.toString();
  if (!userId) {
    console.error('sendNotification: No userId provided');
    return [];
  }

  await dbConnect();

  // Fetch or create preferences
  let preferences = await NotificationPreference.findOne({ 
    userId, 
    userType: user.userType || 'candidate' 
  });

  if (!preferences) {
    preferences = await NotificationPreference.create({
      userId,
      userType: user.userType || 'candidate'
    });
  }

  // 1. Check if this TYPE of notification is enabled
  if (options.type && !preferences.types[options.type]) {
    console.log(`Notification of type ${options.type} is disabled for user ${userId}`);
    return [];
  }

  const tasks: Promise<unknown>[] = [];

  // 2. Send Email Notification if enabled
  if (options.emailTemplateId && user.email && preferences.channels.email) {
    tasks.push(
      sendEmailNotification({
        email: user.email,
        templateId: options.emailTemplateId,
        data: options.emailData || {},
        userId: userId,
        userType: user.userType,
        subject: options.title,
      })
    );
  }

  // 3. Send Push Notification if enabled
  if (preferences.channels.push) {
    const pushTopic = user.ntfyTopic || `user_${userId}`;
    if (pushTopic) {
      tasks.push(
        sendPushNotification({
          topic: pushTopic,
          title: options.title,
          message: options.message,
          priority: options.priority || 3,
          tags: options.tags || [],
          click: options.actionUrl,
          userId: userId,
          userType: user.userType,
        })
      );
    }
  }

  // Wait for all notification attempts
  const results = await Promise.allSettled(tasks);
  
  // Log any failures
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Notification task ${index} failed:`, result.reason);
    }
  });

  return results;
}

// End of notification service
