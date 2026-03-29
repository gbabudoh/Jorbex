import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function PlaybackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) redirect(`/login?next=/interview/${id}/playback`);

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      employer: { select: { companyName: true } },
      candidate: { select: { name: true } },
      job:      { select: { title: true } },
    },
  });

  if (!interview) return notFound();

  const isEmployer  = session.user.userType === 'employer'  && session.user.id === interview.employerId;
  const isCandidate = session.user.userType === 'candidate' && session.user.id === interview.candidateId;

  if (!isEmployer && !isCandidate) return notFound();

  const jobTitle = interview.job?.title ?? interview.jobTitle ?? 'Interview';
  const { recordingStatus, recordingUrl } = interview;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={isEmployer ? '/employer/interviews' : '/candidate/interviews'}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white">Interview Recording</h1>
            <p className="text-xs text-gray-500">{jobTitle} · {interview.employer.companyName} &amp; {interview.candidate.name}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          recordingStatus === 'READY'      ? 'bg-green-500/20 text-green-400' :
          recordingStatus === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400' :
          recordingStatus === 'RECORDING'  ? 'bg-red-500/20 text-red-400' :
          recordingStatus === 'FAILED'     ? 'bg-red-500/20 text-red-400' :
                                             'bg-gray-700 text-gray-400'
        }`}>
          {recordingStatus}
        </span>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">

        {recordingStatus === 'READY' && recordingUrl ? (
          <div className="w-full max-w-4xl space-y-4">
            <video
              controls
              className="w-full rounded-2xl bg-black shadow-2xl"
              src={recordingUrl}
            >
              Your browser does not support the video element.
            </video>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{jobTitle} · {new Date(interview.dateTime).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              <a
                href={recordingUrl}
                download
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          </div>
        ) : recordingStatus === 'PROCESSING' ? (
          <StatusCard
            icon="clock"
            color="yellow"
            title="Processing recording"
            body="LiveKit is finalising the recording file. This usually takes a few minutes — refresh the page to check again."
          />
        ) : recordingStatus === 'RECORDING' ? (
          <StatusCard
            icon="dot"
            color="red"
            title="Recording in progress"
            body="The interview is currently being recorded. The playback will be available here once the recording is stopped and processed."
          />
        ) : recordingStatus === 'FAILED' ? (
          <StatusCard
            icon="error"
            color="red"
            title="Recording failed"
            body="There was an error processing the recording. Please contact support if you need assistance."
          />
        ) : (
          <StatusCard
            icon="none"
            color="gray"
            title="No recording available"
            body="This interview was not recorded, or recording has not been started yet."
          />
        )}
      </main>
    </div>
  );
}

function StatusCard({ icon, color, title, body }: {
  icon: 'clock' | 'dot' | 'error' | 'none';
  color: 'yellow' | 'red' | 'gray';
  title: string;
  body: string;
}) {
  const ring = color === 'yellow' ? 'bg-yellow-500/15 border-yellow-500/20' :
               color === 'red'    ? 'bg-red-500/15 border-red-500/20' :
                                    'bg-gray-700/30 border-gray-700';
  const iconColor = color === 'yellow' ? 'text-yellow-400' :
                    color === 'red'    ? 'text-red-400' : 'text-gray-500';
  const titleColor = color === 'yellow' ? 'text-yellow-300' :
                     color === 'red'    ? 'text-red-300' : 'text-gray-300';

  return (
    <div className="max-w-sm text-center space-y-4">
      <div className={`w-16 h-16 rounded-2xl border mx-auto flex items-center justify-center ${ring}`}>
        {icon === 'clock' && (
          <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {icon === 'dot' && (
          <span className={`w-5 h-5 rounded-full animate-pulse ${color === 'red' ? 'bg-red-500' : 'bg-gray-500'}`} />
        )}
        {icon === 'error' && (
          <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        )}
        {icon === 'none' && (
          <svg className={`w-7 h-7 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div>
        <p className={`font-semibold mb-1 ${titleColor}`}>{title}</p>
        <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
