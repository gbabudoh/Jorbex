import axios from 'axios';
import Employer from '@/models/Employer';

const MATTERMOST_URL = process.env.MATTERMOST_URL;
const MATTERMOST_BOT_TOKEN = process.env.MATTERMOST_BOT_TOKEN;
const MATTERMOST_TEAM_ID = process.env.MATTERMOST_TEAM_ID;

const client = axios.create({
  baseURL: `${MATTERMOST_URL}/api/v4`,
  headers: {
    Authorization: `Bearer ${MATTERMOST_BOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Helper to post messages
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function sendMessage(channelId: string, message: string, props?: any) {
  if (!MATTERMOST_URL || !MATTERMOST_BOT_TOKEN) return;

  try {
    const response = await client.post('/posts', {
      channel_id: channelId,
      message: message,
      props: props,
    });
    return response.data;
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    console.error('Mattermost Post Message Error:', error.response?.data || error.message);
    // Don't throw, just log. Notifications shouldn't break the main flow.
  }
}

// User-defined Notification Helpers

export async function notifyInterviewScheduled(
  channelId: string,
  candidateName: string,
  position: string,
  date: Date,
  interviewerName: string,
  meetingUrl: string
) {
  const formattedDate = date.toLocaleString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
  });

  const message = `✅ **Interview Scheduled**
  
**Candidate:** ${candidateName}
**Position:** ${position}
**Date:** ${formattedDate}
**Interviewer:** ${interviewerName}
  
[Join Meeting](${meetingUrl})`;

  return sendMessage(channelId, message);
}

export async function notifyInterviewCompleted(
  channelId: string,
  candidateName: string,
  position: string,
  interviewerName: string,
  rating?: number,
  feedback?: string
) {
  const message = `✅ **Interview Completed**

**Candidate:** ${candidateName}
**Position:** ${position}
**Interviewer:** ${interviewerName}
**Rating:** ${rating ? '⭐'.repeat(rating) : 'N/A'}
**Feedback:** ${feedback || 'No feedback provided yet.'}`;

  return sendMessage(channelId, message);
}

export async function notifyNewApplication(
  channelId: string,
  candidateName: string,
  position: string,
  applicationUrl: string
) {
  const message = `📥 **New Application Received**

**Candidate:** ${candidateName}
**Position:** ${position}

[View Application](${applicationUrl})`;

  return sendMessage(channelId, message);
}

export async function notifyCandidateHired(
  channelId: string,
  candidateName: string,
  position: string
) {
  const message = `🎉 **Candidate Hired!**

**${candidateName}** accepted the offer for **${position}**.
Congratulations to the team! 🚀`;

  return sendMessage(channelId, message);
}

export async function notifyNewEmployerSignup(
  channelId: string,
  companyName: string,
  contactName: string,
  contactEmail: string,
  companySize?: string
) {
  const message = `🏢 **New Employer Signup!**

**Company:** ${companyName}
**Contact:** ${contactName}
**Email:** ${contactEmail}
**Size:** ${companySize || 'Not specified'}

🎯 Follow up within 24 hours!`;

  return sendMessage(channelId, message);
}

// Original helper object kept for backward compatibility if used elsewhere
/* eslint-disable @typescript-eslint/no-explicit-any */
export const mattermost = {
  createChannel: async (options: any) => {
    try {
      const response = await client.post('/channels', {
        team_id: options.teamId,
        name: options.name,
        display_name: options.displayName,
        purpose: options.purpose,
        header: options.header,
        type: options.type || 'P',
      });
      return response.data;
      return response.data;
    } catch (error: any) {
      console.error('Mattermost Create Channel Error:', error);
      throw error;
    }
  },
  
  createHiringChannel: async (employerId: string, jobId: string, jobTitle: string) => {
    const employer = await Employer.findById(employerId);
    if (!employer) throw new Error('Employer not found');
    const teamId = employer.mattermostTeamId || MATTERMOST_TEAM_ID;
    if (!teamId) throw new Error('Mattermost Team ID not configured');

    const channelName = `hiring-${jobId.toString().slice(-6)}`;
    return mattermost.createChannel({
      teamId,
      name: channelName.toLowerCase(),
      displayName: `Hiring: ${jobTitle}`,
      type: 'P',
    });
  },

  postMessage: async (options: any) => {
     return sendMessage(options.channelId, options.message, options.props);
  }
};
