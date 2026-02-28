import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import JitsiMeeting from '@/components/JitsiMeeting';

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      employer: { select: { companyName: true } },
      candidate: { select: { name: true } },
    },
  });

  if (!interview) {
    return notFound();
  }

  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_URL?.replace('https://', '').replace('/', '') || 'meet.jit.si';

  const serializedInterview = {
    id: interview.id,
    roomName: interview.meetingRoomName,
    status: interview.status,
    employerName: interview.employer.companyName,
    candidateName: interview.candidate.name,
    dateTime: interview.dateTime.toISOString(),
  };

  const currentUser = { name: 'Participant', email: '' };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
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
            {serializedInterview.status}
          </div>
        </div>
      </header>
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
