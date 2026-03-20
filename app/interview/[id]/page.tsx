import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import InterviewRoom from '@/components/InterviewRoom';

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
    interviewers: (interview.interviewers as { name: string; email: string }[]) || [],
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Render all interviewers if it's a panel, otherwise show Employer name */}
            {serializedInterview.interviewers.length > 0 ? (
              serializedInterview.interviewers.map((inv, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/20">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Interviewer</span>
                  <span className="text-xs font-semibold text-white">{inv.name}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/20">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Employer</span>
                <span className="text-xs font-semibold text-white">{serializedInterview.employerName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/20">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Candidate</span>
              <span className="text-xs font-semibold text-white">{serializedInterview.candidateName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
            {serializedInterview.status}
          </div>
        </div>
      </header>
      <main className="flex-1 relative flex flex-col min-h-0">
        <InterviewRoom
          roomName={serializedInterview.roomName}
          displayName="Participant"
          serverUrl={livekitUrl}
        />
      </main>
    </div>
  );
}
