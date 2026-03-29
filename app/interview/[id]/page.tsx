import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import InterviewClientShell from '@/components/InterviewClientShell';

export default async function InterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, { token: panelToken }] = await Promise.all([params, searchParams]);

  const [interview, session] = await Promise.all([
    prisma.interview.findUnique({
      where: { id },
      include: {
        employer: { select: { companyName: true } },
        candidate: { select: { name: true } },
        job:      { select: { title: true } },
      },
    }),
    getServerSession(authOptions),
  ]);

  if (!interview) return notFound();

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

  // Resolve panel invite token (for interviewers without a Jorbex account)
  let panelName: string | undefined;
  if (panelToken) {
    const invite = await prisma.panelInvite.findUnique({ where: { token: panelToken } });
    if (invite && invite.interviewId === id && invite.expiresAt > new Date()) {
      panelName = invite.name;
      if (!invite.usedAt) {
        await prisma.panelInvite.update({ where: { token: panelToken }, data: { usedAt: new Date() } });
      }
    }
  }

  const isEmployer =
    session?.user?.userType === 'employer' &&
    session?.user?.id === interview.employerId;

  const isCandidate =
    session?.user?.userType === 'candidate' &&
    session?.user?.id === interview.candidateId;

  const isPanelMember = !!panelName;

  // Display name priority: panel invite > employer session > candidate session > guest
  const displayName = panelName
    ?? (isEmployer  ? interview.employer.companyName : undefined)
    ?? (isCandidate ? interview.candidate.name       : undefined)
    ?? 'Participant';

  const jobTitle = interview.job?.title ?? interview.jobTitle ?? 'Interview';

  const interviewers = (interview.interviewers as { name: string; email: string }[]) ?? [];

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          {interviewers.length > 0 ? (
            interviewers.map((inv, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/20">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Interviewer</span>
                <span className="text-xs font-semibold text-white">{inv.name}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/20">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Employer</span>
              <span className="text-xs font-semibold text-white">{interview.employer.companyName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/20">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Candidate</span>
            <span className="text-xs font-semibold text-white">{interview.candidate.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
            {interview.status}
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col min-h-0">
        <InterviewClientShell
          interviewId={id}
          roomName={interview.meetingRoomName ?? `jorbex-${id}`}
          displayName={displayName}
          serverUrl={livekitUrl}
          duration={interview.duration}
          scheduledAt={interview.dateTime.toISOString()}
          isEmployer={isEmployer}
          isPanelMember={isPanelMember}
          panelToken={panelToken}
          employerName={interview.employer.companyName}
          candidateName={interview.candidate.name}
          jobTitle={jobTitle}
        />
      </main>
    </div>
  );
}
