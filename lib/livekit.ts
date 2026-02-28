/**
 * LiveKit utility for generating access tokens and room names
 */
import { AccessToken } from 'livekit-server-sdk';

export interface InterviewMeeting {
  meetingUrl: string;
  meetingRoomName: string;
  candidateUrl: string;
  employerUrl: string;
}

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

/**
 * Generate a LiveKit access token for a participant
 */
export async function createLiveKitToken(
  roomName: string,
  participantName: string,
  participantIdentity: string
): Promise<string> {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await at.toJwt();
}

/**
 * Create interview meeting room info
 */
export function createInterviewMeeting(
  interviewId: string,
  candidateName: string,
  employerName: string
): InterviewMeeting {
  const roomName = `jorbex-interview-${interviewId}-${Math.random().toString(36).substring(7)}`;

  // Meeting URLs point to our own interview page which handles LiveKit connection
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const meetingUrl = `${baseUrl}/interview/${interviewId}`;

  return {
    meetingUrl,
    meetingRoomName: roomName,
    candidateUrl: meetingUrl,
    employerUrl: meetingUrl,
  };
}

export { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET };
