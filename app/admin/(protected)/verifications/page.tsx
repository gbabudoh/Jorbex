'use client';

import { useState, useEffect, useCallback } from 'react';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type Kind = 'candidate' | 'company';

interface CandidateVerification {
  id: string;
  docType: 'PASSPORT' | 'NATIONAL_ID';
  docNumber?: string;
  country: string;
  fileUrl: string;
  status: VerificationStatus;
  reviewNotes?: string;
  submittedAt: string;
  candidate: { id: string; name: string; email: string; country?: string };
}

interface CompanyVerification {
  id: string;
  bizType: 'REGISTERED' | 'INFORMAL';
  regNumber?: string;
  regDocUrl?: string;
  idDocType?: string;
  idDocUrl?: string;
  bankName?: string;
  bankAccName?: string;
  bankStmtUrl?: string;
  status: VerificationStatus;
  reviewNotes?: string;
  submittedAt: string;
  employer: { id: string; name: string; email: string; companyName: string; country?: string };
}

const STATUS_PILL: Record<VerificationStatus, string> = {
  PENDING:  'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
};

function ReviewModal({
  id, kind, name, onClose, onDone,
}: {
  id: string; kind: Kind; name: string;
  onClose: () => void; onDone: () => void;
}) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/verifications/${id}?kind=${kind}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNotes: notes }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-slate-900 mb-1">Review Submission</h3>
        <p className="text-slate-500 text-sm mb-5">{name}</p>

        <div className="flex gap-3 mb-5">
          {(['approve', 'reject'] as const).map((a) => (
            <button key={a} type="button" onClick={() => setAction(a)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all capitalize ${
                action === a
                  ? a === 'approve'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              {a === 'approve' ? '✓ Approve' : '✕ Reject'}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Note to applicant <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder={action === 'reject' ? 'Explain why the document was rejected...' : 'Optional note...'}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none" />
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 ${
              action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'
            }`}
          >
            {loading ? 'Saving...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function DocLink({ url, label }: { url?: string; label: string }) {
  if (!url) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      {label}
    </a>
  );
}

export default function AdminVerificationsPage() {
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [candidates, setCandidates] = useState<CandidateVerification[]>([]);
  const [companies, setCompanies] = useState<CompanyVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ id: string; kind: Kind; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/verifications?type=all&status=${tab}`);
    const d = await res.json();
    setCandidates(d.candidates || []);
    setCompanies(d.companies || []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const totalPending = tab === 'PENDING' ? candidates.length + companies.length : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Verification Queue</h1>
            <p className="text-slate-500 text-sm mt-0.5">Review identity and company verification submissions</p>
          </div>
          {tab === 'PENDING' && totalPending > 0 && (
            <span className="px-3 py-1 bg-amber-100 border border-amber-200 text-amber-700 text-sm font-bold rounded-full">
              {totalPending} pending
            </span>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button key={s} onClick={() => setTab(s)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s === 'PENDING' ? '⏳ Pending' : s === 'APPROVED' ? '✓ Approved' : '✕ Rejected'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Candidates section */}
            <section className="mb-10">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Candidate Identity — {candidates.length}
              </h2>
              {candidates.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
                  <p className="text-slate-400 text-sm">No {tab.toLowerCase()} candidate verifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidates.map((v) => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-5">
                      {/* Left */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900 text-sm">{v.candidate.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_PILL[v.status]}`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mb-3">{v.candidate.email} · {v.candidate.country || '—'}</p>
                        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">Document</p>
                            <p className="text-slate-700 font-semibold">{v.docType === 'PASSPORT' ? '🛂 Passport' : '🪪 National ID'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">Country</p>
                            <p className="text-slate-700 font-semibold">{v.country}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">Doc Number</p>
                            <p className="text-slate-700 font-semibold">{v.docNumber || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <DocLink url={v.fileUrl} label="View Document" />
                          <span className="text-slate-300 text-xs">
                            {new Date(v.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {v.reviewNotes && (
                          <p className="mt-2 text-xs text-slate-500 italic">Note: {v.reviewNotes}</p>
                        )}
                      </div>
                      {/* Action */}
                      {v.status === 'PENDING' && (
                        <button
                          onClick={() => setModal({ id: v.id, kind: 'candidate', name: `${v.candidate.name} — ${v.docType}` })}
                          className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Companies section */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Company / Employer — {companies.length}
              </h2>
              {companies.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
                  <p className="text-slate-400 text-sm">No {tab.toLowerCase()} company verifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((v) => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900 text-sm">{v.employer.companyName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_PILL[v.status]}`}>
                            {v.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                            {v.bizType === 'REGISTERED' ? '🏢 Registered' : '🏪 Informal'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mb-3">
                          {v.employer.name} · {v.employer.email} · {v.employer.country || '—'}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                          {v.bizType === 'REGISTERED' ? (
                            <>
                              {v.regNumber && <span className="text-xs text-slate-600">Reg: <strong>{v.regNumber}</strong></span>}
                              <DocLink url={v.regDocUrl} label="Registration Cert" />
                            </>
                          ) : (
                            <>
                              <DocLink url={v.idDocUrl} label={`ID Doc (${v.idDocType || 'ID'})`} />
                              {v.bankName && <span className="text-xs text-slate-600">{v.bankName} · <strong>{v.bankAccName}</strong></span>}
                              <DocLink url={v.bankStmtUrl} label="Bank Statement" />
                            </>
                          )}
                          <span className="text-slate-300 text-xs">
                            {new Date(v.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {v.reviewNotes && (
                          <p className="mt-2 text-xs text-slate-500 italic">Note: {v.reviewNotes}</p>
                        )}
                      </div>
                      {v.status === 'PENDING' && (
                        <button
                          onClick={() => setModal({ id: v.id, kind: 'company', name: `${v.employer.companyName} — ${v.bizType}` })}
                          className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {modal && (
        <ReviewModal
          id={modal.id}
          kind={modal.kind}
          name={modal.name}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
