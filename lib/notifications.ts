// Unified notification service — Novu (email, SMS, push, chat, in-app) + Mattermost (internal) + ntfy (push)

import { createInterviewMeeting, InterviewMeeting } from './livekit';
import prisma from '@/lib/prisma';
import { triggerNotification, syncSubscriber, WORKFLOWS } from './novu';
import { pushToCandidate as webPushToCandidate } from './webpush';
import { RoleType } from '@prisma/client';

import {
  sendMessage,
  notifyInterviewScheduled as mattermostInterviewScheduled,
  notifyInterviewCompleted as mattermostInterviewCompleted,
  notifyCandidateHired as mattermostCandidateHired,
  notifyNewApplication as mattermostNewApplication,
  notifyNewEmployerSignup as mattermostNewEmployerSignup,
} from './mattermost';

// ─── Mattermost channel IDs ──────────────────────────────────────────────────
const MM = {
  INTERVIEWS: process.env.MATTERMOST_CHANNEL_INTERVIEWS || '',
  HIRING:     process.env.MATTERMOST_CHANNEL_HIRING     || '',
  SALES:      process.env.MATTERMOST_CHANNEL_SALES      || '',
  DEV_ALERTS: process.env.MATTERMOST_CHANNEL_DEV_ALERTS || '',
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ScheduleInterviewParams {
  interviewId:    string;
  candidateId:    string;
  candidateEmail: string;
  candidateName:  string;
  employerId:     string;
  employerEmail:  string;
  employerName:   string;
  companyName:    string;
  position:       string;
  interviewDate:  Date;
  interviewerName?: string;
}

export interface InterviewResult extends InterviewMeeting {
  interviewId:    string;
  emailSent:      boolean;
  pushSent:       boolean;
  mattermostSent: boolean;
}

// ─── Helper: log notification ────────────────────────────────────────────────
async function logNotification(params: {
  userId:    string;
  userType:  'candidate' | 'employer';
  email?:    string | null;
  type:      string;
  channel:   'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP' | 'MATTERMOST';
  subject:   string;
  content:   string;
  status:    'SENT' | 'FAILED';
  error?:    string;
}) {
  try {
    await prisma.notificationLog.create({
      data: {
        userType:  params.userType.toUpperCase() as RoleType,
        ...(params.userType === 'employer'
          ? { employerId: params.userId }
          : { candidateId: params.userId }),
        email:   params.email || undefined,
        type:    params.type,
        channel: params.channel,
        subject: params.subject,
        content: params.content,
        status:  params.status,
        sentAt:  params.status === 'SENT' ? new Date() : undefined,
        error:   params.error,
      },
    });
  } catch (err) {
    console.error('[Notification] log failed:', err);
  }
}

// ─── Helper: web push for a candidate ───────────────────────────────────────
async function pushToCandidate(candidateId: string, title: string, body: string, url?: string) {
  try {
    await webPushToCandidate(candidateId, { title, body, url });
  } catch (err) {
    console.error('[WebPush] push failed:', err);
  }
}

// ─── Helper: trigger via Novu + log ─────────────────────────────────────────
async function sendViaNovu(params: {
  workflowId:   (typeof WORKFLOWS)[keyof typeof WORKFLOWS];
  userId:       string;
  userType:     'candidate' | 'employer';
  email?:       string | null;
  phone?:       string | null;
  name?:        string;
  subject:      string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload:      Record<string, any>;
}) {
  const { workflowId, userId, userType, email, phone, name, subject, payload } = params;

  // Ensure subscriber exists in Novu
  if (name) {
    await syncSubscriber({ subscriberId: userId, name, email, phone });
  }

  try {
    await triggerNotification({
      workflowId,
      subscriberId: userId,
      to: { email, phone, firstName: name?.split(' ')[0] },
      payload,
    });

    await logNotification({
      userId, userType, email, type: workflowId.toUpperCase().replace(/-/g, '_'),
      channel: 'EMAIL', subject, content: JSON.stringify(payload), status: 'SENT',
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await logNotification({
      userId, userType, email, type: workflowId.toUpperCase().replace(/-/g, '_'),
      channel: 'EMAIL', subject, content: JSON.stringify(payload), status: 'FAILED', error,
    });
  }
}

// ─── Interview Scheduling ────────────────────────────────────────────────────
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
  const meeting = createInterviewMeeting(interviewId, candidateName, employerName);

  const formattedDate = interviewDate.toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

  let novuSent = false;
  let mattermostSent = false;

  // 1. Notify candidate via Novu (email + SMS + push + chat + in-app)
  try {
    await sendViaNovu({
      workflowId:  WORKFLOWS.INTERVIEW_SCHEDULED,
      userId:      candidateId,
      userType:    'candidate',
      email:       candidateEmail,
      name:        candidateName,
      subject:     `Interview Scheduled — ${position} at ${companyName}`,
      payload: {
        candidateName,
        companyName,
        position,
        interviewDate: formattedDate,
        meetingUrl:    meeting.candidateUrl,
        interviewerName: interviewerName || employerName,
      },
    });
    novuSent = true;
  } catch { novuSent = false; }

  // 2. ntfy push
  await pushToCandidate(
    candidateId,
    `Interview Scheduled — ${position} at ${companyName}`,
    `${formattedDate}\nJoin: ${meeting.candidateUrl}`,
    meeting.candidateUrl,
  );

  // 3. Internal Mattermost (team visibility)
  try {
    if (MM.INTERVIEWS) {
      await mattermostInterviewScheduled(
        MM.INTERVIEWS, candidateName, position, interviewDate,
        interviewerName || employerName, meeting.meetingUrl
      );
      mattermostSent = true;
    }
  } catch (err) { console.error('[Mattermost] interview scheduled:', err); }

  return {
    interviewId, ...meeting,
    emailSent: novuSent, pushSent: novuSent, mattermostSent,
  };
}

// ─── Interview Reminders ─────────────────────────────────────────────────────
export async function sendInterviewReminders(
  candidateId:    string,
  candidateEmail: string,
  candidateName:  string,
  companyName:    string,
  position:       string,
  interviewDate:  Date,
  meetingUrl:     string,
  minutesUntil:   number,
): Promise<{ emailSent: boolean; pushSent: boolean }> {
  let sent = false;
  try {
    await sendViaNovu({
      workflowId: WORKFLOWS.INTERVIEW_REMINDER,
      userId:     candidateId,
      userType:   'candidate',
      email:      candidateEmail,
      name:       candidateName,
      subject:    `Reminder: Interview in ${minutesUntil} minutes`,
      payload: {
        candidateName, companyName, position, minutesUntil,
        meetingUrl, interviewDate: new Date(interviewDate).toISOString(),
      },
    });
    sent = true;
  } catch { sent = false; }

  await pushToCandidate(
    candidateId,
    `Reminder: Interview in ${minutesUntil} minutes`,
    `${position} at ${companyName}\nJoin: ${meetingUrl}`,
    meetingUrl,
  );

  return { emailSent: sent, pushSent: sent };
}

// ─── Interview Cancellation ──────────────────────────────────────────────────
export async function cancelInterview(
  candidateId:    string,
  candidateEmail: string,
  candidateName:  string,
  companyName:    string,
  position:       string,
  reason?:        string,
): Promise<{ emailSent: boolean; pushSent: boolean; mattermostSent: boolean }> {
  let sent = false;
  let mattermostSent = false;

  try {
    await sendViaNovu({
      workflowId: WORKFLOWS.INTERVIEW_CANCELLED,
      userId:     candidateId,
      userType:   'candidate',
      email:      candidateEmail,
      name:       candidateName,
      subject:    `Interview Cancelled — ${position} at ${companyName}`,
      payload: { candidateName, companyName, position, reason: reason || 'Not specified' },
    });
    sent = true;
  } catch { sent = false; }

  await pushToCandidate(
    candidateId,
    `Interview Cancelled — ${position} at ${companyName}`,
    `Reason: ${reason || 'Not specified'}`,
  );

  try {
    if (MM.INTERVIEWS) {
      await sendMessage(
        MM.INTERVIEWS,
        `❌ **Interview Cancelled**\n\n**Candidate:** ${candidateName}\n**Position:** ${position} at ${companyName}\n**Reason:** ${reason || 'Not specified'}`
      );
      mattermostSent = true;
    }
  } catch (err) { console.error('[Mattermost] interview cancelled:', err); }

  return { emailSent: sent, pushSent: sent, mattermostSent };
}

// ─── Interview Rescheduling ──────────────────────────────────────────────────
export async function rescheduleInterview(
  interviewId:    string,
  candidateId:    string,
  candidateEmail: string,
  candidateName:  string,
  companyName:    string,
  position:       string,
  newDate:        Date,
  interviewerName?: string,
): Promise<InterviewResult> {
  const meeting = createInterviewMeeting(interviewId, candidateName, 'Employer');
  let sent = false;
  let mattermostSent = false;

  const formattedDate = newDate.toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  try {
    await sendViaNovu({
      workflowId: WORKFLOWS.INTERVIEW_RESCHEDULED,
      userId:     candidateId,
      userType:   'candidate',
      email:      candidateEmail,
      name:       candidateName,
      subject:    `Interview Rescheduled — ${position} at ${companyName}`,
      payload: {
        candidateName, companyName, position, interviewDate: formattedDate,
        meetingUrl: meeting.candidateUrl, interviewerName: interviewerName || 'Hiring Manager',
      },
    });
    sent = true;
  } catch { sent = false; }

  await pushToCandidate(
    candidateId,
    `Interview Rescheduled — ${position} at ${companyName}`,
    `New date: ${formattedDate}\nJoin: ${meeting.candidateUrl}`,
    meeting.candidateUrl,
  );

  try {
    if (MM.INTERVIEWS) {
      await sendMessage(
        MM.INTERVIEWS,
        `🔄 **Interview Rescheduled**\n\n**Candidate:** ${candidateName}\n**Position:** ${position} at ${companyName}\n**New Date:** ${formattedDate}`
      );
      mattermostSent = true;
    }
  } catch (err) { console.error('[Mattermost] interview rescheduled:', err); }

  return {
    interviewId, ...meeting,
    emailSent: sent, pushSent: sent, mattermostSent,
  };
}

// ─── New Application ─────────────────────────────────────────────────────────
export async function notifyNewApplication(
  candidateId:    string,
  candidateEmail: string,
  candidateName:  string,
  employerId:     string,
  companyName:    string,
  position:       string,
  applicationId:  string,
  applicationUrl: string,
): Promise<{ candidateEmailSent: boolean; employerPushSent: boolean; mattermostSent: boolean }> {
  let candidateSent = false;
  let employerSent = false;
  let mattermostSent = false;

  // Notify candidate
  try {
    await sendViaNovu({
      workflowId: WORKFLOWS.NEW_APPLICATION,
      userId:     candidateId,
      userType:   'candidate',
      email:      candidateEmail,
      name:       candidateName,
      subject:    `Application Received — ${position} at ${companyName}`,
      payload:    { candidateName, companyName, position, applicationId },
    });
    candidateSent = true;
  } catch { candidateSent = false; }

  await pushToCandidate(
    candidateId,
    `Application Received — ${position} at ${companyName}`,
    `Your application has been submitted successfully.`,
  );

  // Notify employer
  try {
    await sendViaNovu({
      workflowId: WORKFLOWS.NEW_APPLICATION,
      userId:     employerId,
      userType:   'employer',
      subject:    `New Application — ${position}`,
      payload:    { candidateName, position, applicationUrl, isEmployerNotification: true },
    });
    employerSent = true;
  } catch { employerSent = false; }

  try {
    if (MM.HIRING) {
      await mattermostNewApplication(MM.HIRING, candidateName, position, applicationUrl);
      mattermostSent = true;
    }
  } catch (err) { console.error('[Mattermost] new application:', err); }

  return { candidateEmailSent: candidateSent, employerPushSent: employerSent, mattermostSent };
}

// ─── Assessment Assigned ─────────────────────────────────────────────────────
export async function notifyAssessmentAssigned(
  candidateId:    string,
  candidateEmail: string,
  candidateName:  string,
  companyName:    string,
  assessmentTitle: string,
  deadline?:      Date | null,
): Promise<{ sent: boolean }> {
  let sent = false;
  try {
    await sendViaNovu({
      workflowId: WORKFLOWS.ASSESSMENT_ASSIGNED,
      userId:     candidateId,
      userType:   'candidate',
      email:      candidateEmail,
      name:       candidateName,
      subject:    `New Assessment from ${companyName}`,
      payload: {
        candidateName, companyName, assessmentTitle,
        deadline: deadline ? deadline.toISOString() : null,
        assessmentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/tests`,
      },
    });
    sent = true;
  } catch { sent = false; }

  await pushToCandidate(
    candidateId,
    `New Assessment from ${companyName}`,
    `${assessmentTitle}${deadline ? ` — Due: ${deadline.toLocaleDateString()}` : ''}`,
    `${process.env.NEXT_PUBLIC_APP_URL}/candidate/tests`,
  );

  return { sent };
}

// ─── Offer Received ──────────────────────────────────────────────────────────
export async function notifyOfferReceived(
  candidateId:    string,
  candidateEmail: string,
  candidateName:  string,
  companyName:    string,
  position:       string,
  offerUrl:       string,
): Promise<{ sent: boolean }> {
  let sent = false;
  try {
    await sendViaNovu({
      workflowId: WORKFLOWS.OFFER_RECEIVED,
      userId:     candidateId,
      userType:   'candidate',
      email:      candidateEmail,
      name:       candidateName,
      subject:    `Job Offer from ${companyName} — ${position}`,
      payload:    { candidateName, companyName, position, offerUrl },
    });
    sent = true;
  } catch { sent = false; }

  await pushToCandidate(
    candidateId,
    `Job Offer from ${companyName} — ${position}`,
    `You have received a job offer. Tap to review.`,
    offerUrl,
  );

  return { sent };
}

// ─── New Message ─────────────────────────────────────────────────────────────
export async function notifyNewMessage(
  recipientId:    string,
  recipientEmail: string,
  recipientName:  string,
  recipientType:  'candidate' | 'employer',
  senderName:     string,
  messagePreview: string,
  inboxUrl:       string,
): Promise<{ sent: boolean }> {
  let sent = false;
  try {
    await sendViaNovu({
      workflowId: WORKFLOWS.NEW_MESSAGE,
      userId:     recipientId,
      userType:   recipientType,
      email:      recipientEmail,
      name:       recipientName,
      subject:    `New message from ${senderName}`,
      payload:    { recipientName, senderName, messagePreview, inboxUrl },
    });
    sent = true;
  } catch { sent = false; }

  if (recipientType === 'candidate') {
    await pushToCandidate(
      recipientId,
      `New message from ${senderName}`,
      messagePreview,
      inboxUrl,
    );
  }

  return { sent };
}

// ─── Internal-only helpers (Mattermost) ──────────────────────────────────────
export async function notifyInterviewCompleted(
  candidateName: string,
  companyName:   string,
  position:      string,
  interviewerName: string,
  rating?:       number,
  feedback?:     string,
): Promise<{ mattermostSent: boolean }> {
  let mattermostSent = false;
  try {
    if (MM.INTERVIEWS) {
      await mattermostInterviewCompleted(
        MM.INTERVIEWS, candidateName, position, interviewerName, rating, feedback
      );
      mattermostSent = true;
    }
  } catch (err) { console.error(`[Mattermost] interview completed for ${companyName}:`, err); }
  return { mattermostSent };
}

export async function notifyCandidateHired(
  candidateName: string,
  companyName:   string,
  position:      string,
): Promise<{ mattermostSent: boolean }> {
  let mattermostSent = false;
  try {
    if (MM.HIRING) {
      await mattermostCandidateHired(MM.HIRING, candidateName, position);
      mattermostSent = true;
    }
  } catch (err) { console.error(`[Mattermost] candidate hired at ${companyName}:`, err); }
  return { mattermostSent };
}

export async function sendSystemAlert(
  message:  string,
  severity: 'info' | 'warning' | 'error' = 'info',
): Promise<{ mattermostSent: boolean }> {
  const icons = { info: 'ℹ️', warning: '⚠️', error: '🚨' };
  let mattermostSent = false;
  try {
    if (MM.DEV_ALERTS) {
      await sendMessage(MM.DEV_ALERTS, `${icons[severity]} **System Alert**\n\n${message}`);
      mattermostSent = true;
    }
  } catch (err) { console.error('[Mattermost] system alert:', err); }
  return { mattermostSent };
}

export async function notifyNewEmployerSignup(
  companyName:   string,
  contactName:   string,
  contactEmail:  string,
  companySize?:  string,
): Promise<{ mattermostSent: boolean }> {
  let mattermostSent = false;
  try {
    if (MM.SALES) {
      await mattermostNewEmployerSignup(MM.SALES, companyName, contactName, contactEmail, companySize);
      mattermostSent = true;
    }
  } catch (err) { console.error('[Mattermost] employer signup:', err); }
  return { mattermostSent };
}
