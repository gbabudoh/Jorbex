/**
 * Jitsi Meet utility for generating secure meeting URLs
 */

export interface InterviewMeeting {
  meetingUrl: string;
  meetingRoomName: string;
  candidateUrl: string;
  employerUrl: string;
}

const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_URL || 'https://meet.jit.si';

export function createInterviewMeeting(
  interviewId: string,
  candidateName: string,
  employerName: string
): InterviewMeeting {
  // Generate a unique, unguessable room name
  // Format: jorbex-interview-[id]-[random]
  const roomName = `jorbex-interview-${interviewId}-${Math.random().toString(36).substring(7)}`;
  
  // Base Meeting URL
  const meetingUrl = `${JITSI_DOMAIN}/${roomName}`;
  
  // You could add JWT tokens here in the future for restricted access
  // For now, we'll append display names to the URL for convenience if using Jitsi Meet
  
  const candidateUrl = `${meetingUrl}#userInfo.displayName="${encodeURIComponent(candidateName)}"`;
  const employerUrl = `${meetingUrl}#userInfo.displayName="${encodeURIComponent(employerName)}"`;

  return {
    meetingUrl,
    meetingRoomName: roomName,
    candidateUrl,
    employerUrl
  };
}
