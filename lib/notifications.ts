// Combined notification service for email + push + internal (Mattermost)

import {
  notifyInterviewScheduled,
  notifyInterviewReminder,
  notifyInterviewCancelled,
  notifyInterviewRescheduled,
  notifyEmployerNewApplication,
} from './ntfy';

import {
  sendInterviewInvite,
  sendInterviewReminder as emailInterviewReminder,
  sendInterviewCancellation,
  sendApplicationConfirmation,
} from './listmonk';

import { createInterviewMeeting, InterviewMeeting } from './jitsi';

import {
  sendMessage,
  notifyInterviewScheduled as mattermostInterviewScheduled,
  notifyInterviewCompleted as mattermostInterviewCompleted,
  notifyCandidateHired as mattermostCandidateHired,
  notifyNewApplication as mattermostNewApplication,
  notifyNewEmployerSignup as mattermostNewEmployerSignup,
} from './mattermost';

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

  // Send email notification to candidate
  try {
    await sendInterviewInvite(
      candidateEmail,
      candidateName,
      companyName,
      position,
      interviewDate,
      meeting.candidateUrl,
      interviewerName
    );
    emailSent = true;
  } catch (error) {
    console.error('Failed to send interview email:', error);
  }

  // Send push notification to candidate
  try {
    await notifyInterviewScheduled(
      candidateId,
      companyName,
      position,
      interviewDate,
      meeting.candidateUrl
    );
    pushSent = true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }

  // Send internal Mattermost notification
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
  let emailSent = false;
  let pushSent = false;

  // Send both email and push notification
  const results = await Promise.allSettled([
    emailInterviewReminder(
      candidateEmail,
      candidateName,
      companyName,
      position,
      interviewDate,
      meetingUrl,
      minutesUntil
    ),
    notifyInterviewReminder(
      candidateId,
      companyName,
      position,
      minutesUntil,
      meetingUrl
    ),
  ]);

  emailSent = results[0].status === 'fulfilled';
  pushSent = results[1].status === 'fulfilled';

  return { emailSent, pushSent };
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
  let emailSent = false;
  let pushSent = false;
  let mattermostSent = false;

  const results = await Promise.allSettled([
    sendInterviewCancellation(
      candidateEmail,
      candidateName,
      companyName,
      position,
      reason
    ),
    notifyInterviewCancelled(candidateId, companyName, position, reason),
  ]);

  emailSent = results[0].status === 'fulfilled';
  pushSent = results[1].status === 'fulfilled';

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

  return { emailSent, pushSent, mattermostSent };
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

  let emailSent = false;
  let pushSent = false;
  let mattermostSent = false;

  const results = await Promise.allSettled([
    sendInterviewInvite(
      candidateEmail,
      candidateName,
      companyName,
      position,
      newDate,
      meeting.candidateUrl,
      interviewerName
    ),
    notifyInterviewRescheduled(
      candidateId,
      companyName,
      position,
      newDate,
      meeting.candidateUrl
    ),
  ]);

  emailSent = results[0].status === 'fulfilled';
  pushSent = results[1].status === 'fulfilled';

  // Send internal Mattermost notification
  try {
    if (MATTERMOST_CHANNELS.INTERVIEWS) {
      const formattedDate = newDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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
    emailSent,
    pushSent,
    mattermostSent,
  };
}

// ============================================
// Application Notifications
// ============================================

export async function notifyNewApplication(
  candidateEmail: string,
  candidateName: string,
  employerId: string,
  companyName: string,
  position: string,
  applicationId: string,
  applicationUrl: string
): Promise<{ candidateEmailSent: boolean; employerPushSent: boolean; mattermostSent: boolean }> {
  let candidateEmailSent = false;
  let employerPushSent = false;
  let mattermostSent = false;

  const results = await Promise.allSettled([
    // Email confirmation to candidate
    sendApplicationConfirmation(
      candidateEmail,
      candidateName,
      companyName,
      position,
      applicationId
    ),
    // Push notification to employer
    notifyEmployerNewApplication(
      employerId,
      candidateName,
      position,
      applicationUrl
    ),
  ]);

  candidateEmailSent = results[0].status === 'fulfilled';
  employerPushSent = results[1].status === 'fulfilled';

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

  return { candidateEmailSent, employerPushSent, mattermostSent };
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

// Original generic function for backward compatibility
// End of notification service
