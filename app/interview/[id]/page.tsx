import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import LiveKitMeeting from '@/components/LiveKitMeeting';
import Image from 'next/image';

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

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

  const serializedInterview = {
    id: interview.id,
    roomName: interview.meetingRoomName || `jorbex-${interview.id}`,
    status: interview.status,
    employerName: interview.employer.companyName,
    candidateName: interview.candidate.name,
    dateTime: interview.dateTime.toISOString(),
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Branded Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Jorbex"
            width={100}
            height={32}
            className="h-8 w-auto brightness-0 invert"
          />
          <div className="h-6 w-px bg-gray-700" />
          <div>
            <p className="text-sm font-medium text-gray-200">
              {serializedInterview.employerName} &middot; {serializedInterview.candidateName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
            {serializedInterview.status}
          </div>
        </div>
      </header>

      {/* Video Area */}
      <main className="flex-1 relative">
        <LiveKitMeeting
          roomName={serializedInterview.roomName}
          displayName="Participant"
          serverUrl={livekitUrl}
        />
      </main>
    </div>
  );
}
