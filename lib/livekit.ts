/**
 * LiveKit utility for generating access tokens, room names, and egress (recording)
 */
import { AccessToken, EgressClient, EncodedFileOutput, EncodedFileType, S3Upload } from 'livekit-server-sdk';

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

// ─── Egress (Recording) ───────────────────────────────────────────────────────

const MINIO_ENDPOINT  = process.env.MINIO_ENDPOINT  || '';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || '';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || '';
const MINIO_BUCKET    = process.env.MINIO_BUCKET    || 'jorbex';

/** Derives the predictable MinIO URL for a recording given the interview ID */
export function getRecordingUrl(interviewId: string): string {
  return `${MINIO_ENDPOINT}/${MINIO_BUCKET}/recordings/interview-${interviewId}.mp4`;
}

/**
 * Start a RoomComposite egress that records the interview to MinIO.
 * Returns the LiveKit egressId — store this on the Interview record.
 */
export async function startRoomRecording(roomName: string, interviewId: string): Promise<string> {
  const client = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

  const output = new EncodedFileOutput({
    fileType: EncodedFileType.DEFAULT_FILETYPE,
    filepath: `recordings/interview-${interviewId}.mp4`,
    output: {
      case: 's3',
      value: new S3Upload({
        accessKey: MINIO_ACCESS_KEY,
        secret: MINIO_SECRET_KEY,
        bucket: MINIO_BUCKET,
        endpoint: MINIO_ENDPOINT,
        forcePathStyle: true,
        region: 'us-east-1',
      }),
    },
  });

  const info = await client.startRoomCompositeEgress(roomName, { file: output }, {
    layout: 'speaker-dark',
  });

  return info.egressId;
}

/**
 * Stop an active egress. LiveKit will finalise and upload the file to MinIO.
 */
export async function stopRoomRecording(egressId: string): Promise<void> {
  const client = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  await client.stopEgress(egressId);
}
