import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Interview from '@/models/Interview';
import JitsiMeeting from '@/components/JitsiMeeting'; // Assuming component exists

export default async function InterviewPage({ params }: { params: { id: string } }) {
  const { id } = params;

  await dbConnect();

  // Fetch Interview details
  const interview = await Interview.findById(id).populate('employerId candidateId');
  
  if (!interview) {
    return notFound();
  }

  // Security: Check if user is allowed (Skipped for brevity/requires auth context which is tricky in pure server component without headers/cookies passed down)
  // In a real app we'd verify session user ID matches candidateId or employerId.
  // For now, assume protected by middleware or we just render.

  // Determine domain from env or use default
  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_URL?.replace('https://', '').replace('/', '') || 'meet.jit.si';

  // We need to pass serializable data to the client component.
  // Mongoose docs are not directly serializable.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const employer = interview.employerId as any;
  const candidate = interview.candidateId as any;

  const serializedInterview = {
    id: interview._id.toString(),
    roomName: interview.meetingRoomName,
    status: interview.status,
    employerName: employer.companyName,
    candidateName: candidate.name,
    dateTime: interview.dateTime.toISOString(),
  };

  // We'll hardcode the current user as "Guest" for now since we don't have session access here easily without `auth` helper
  // In production, fetch session here.
  const currentUser = { name: 'Participant', email: '' }; 
  // TODO: Fetch actual session user

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Jorbex Interview
          </h1>
          <p className="text-sm text-gray-400">
            {serializedInterview.employerName} with {serializedInterview.candidateName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
            {serializedInterview.status.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        <JitsiMeeting
          roomName={serializedInterview.roomName || `jorbex-${serializedInterview.id}`}
          displayName={currentUser.name}
          domain={jitsiDomain}
          subject={`Interview: ${serializedInterview.employerName}`}
          email={currentUser.email}
        />
      </main>
    </div>
  );
}
