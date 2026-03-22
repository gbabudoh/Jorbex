'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type BizType = 'REGISTERED' | 'INFORMAL';
type IdDocType = 'PASSPORT' | 'NATIONAL_ID';
type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Verification {
  id: string;
  bizType: BizType;
  regNumber?: string;
  regDocUrl?: string;
  idDocType?: IdDocType;
  idDocUrl?: string;
  bankName?: string;
  bankAccName?: string;
  bankStmtUrl?: string;
  status: VerificationStatus;
  reviewNotes?: string;
  submittedAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; bg: string; icon: string }> = {
  PENDING:  { label: 'Under Review',  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',    icon: '⏳' },
  APPROVED: { label: 'Verified',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '✓' },
  REJECTED: { label: 'Rejected',      color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         icon: '✕' },
};

function FileDropZone({
  label, hint, file, preview, onFile, onClear,
}: {
  label: string; hint: string;
  file: File | null; preview: string | null;
  onFile: (f: File) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          file ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/20'
        }`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="mx-auto max-h-36 rounded-lg object-contain" />
        ) : file ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-amber-700 font-semibold truncate max-w-[200px]">{file.name}</span>
          </div>
        ) : (
          <>
            <svg className="w-9 h-9 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-500 font-medium">Click or drag to upload</p>
            <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
          </>
        )}
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
      {file && (
        <button type="button" onClick={onClear} className="mt-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors">
          Remove file
        </button>
      )}
    </div>
  );
}

export default function EmployerVerifyPage() {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);

  const [bizType, setBizType] = useState<BizType>('REGISTERED');
  const [regNumber, setRegNumber] = useState('');
  const [regFile, setRegFile] = useState<File | null>(null);
  const [regPreview, setRegPreview] = useState<string | null>(null);

  const [idDocType, setIdDocType] = useState<IdDocType>('PASSPORT');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [bankAccName, setBankAccName] = useState('');
  const [stmtFile, setStmtFile] = useState<File | null>(null);
  const [stmtPreview, setStmtPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/verification/company')
      .then((r) => r.json())
      .then((d) => setVerification(d.verification))
      .finally(() => setLoading(false));
  }, []);

  const makePreview = (f: File, setter: (s: string | null) => void) => {
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setter(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setter(null);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch('/api/upload/doc', { method: 'POST', body: fd });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Upload failed'); }
    return res.json() as Promise<{ url: string; key: string }>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let payload: Record<string, unknown> = { bizType };

      if (bizType === 'REGISTERED') {
        if (!regFile) throw new Error('Please upload your company registration certificate');
        const { url, key } = await uploadFile(regFile, 'company-reg');
        payload = { ...payload, regNumber, regDocUrl: url, regDocKey: key };
      } else {
        if (!idFile) throw new Error('Please upload your ID document');
        if (!bankName || !bankAccName) throw new Error('Bank name and account name are required');
        if (!stmtFile) throw new Error('Please upload a bank statement');
        const [idUploaded, stmtUploaded] = await Promise.all([
          uploadFile(idFile, 'identity'),
          uploadFile(stmtFile, 'bank-statements'),
        ]);
        payload = {
          ...payload,
          idDocType,
          idDocUrl: idUploaded.url,
          idDocKey: idUploaded.key,
          bankName,
          bankAccName,
          bankStmtUrl: stmtUploaded.url,
          bankStmtKey: stmtUploaded.key,
        };
      }

      const res = await fetch('/api/verification/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Submission failed'); }
      const { verification: v } = await res.json();
      setVerification(v);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canResubmit = verification?.status === 'REJECTED';
  const isApproved = verification?.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/employer/profile" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors mb-5 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Company Verification</h1>
              <p className="text-slate-500 text-sm">Verify your business to build candidate trust</p>
            </div>
          </div>
        </div>

        {/* Current status */}
        {verification && (
          <div className={`rounded-2xl border p-5 mb-6 ${STATUS_CONFIG[verification.status].bg}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{STATUS_CONFIG[verification.status].icon}</span>
              <div>
                <p className={`font-bold text-sm ${STATUS_CONFIG[verification.status].color}`}>
                  {STATUS_CONFIG[verification.status].label}
                </p>
                <p className="text-slate-500 text-xs">
                  {verification.bizType === 'REGISTERED' ? 'Registered Company' : 'Informal / SME'} ·{' '}
                  Submitted {new Date(verification.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            {verification.reviewNotes && (
              <div className="mt-3 pt-3 border-t border-current/10">
                <p className="text-xs text-slate-500 font-medium mb-0.5">Reviewer Note</p>
                <p className="text-sm text-slate-700">{verification.reviewNotes}</p>
              </div>
            )}
            {isApproved && (
              <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-emerald-700 font-semibold">Your company is verified. No further action needed.</p>
              </div>
            )}
          </div>
        )}

        {success && !isApproved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-emerald-700 font-bold text-sm">Documents submitted successfully</p>
              <p className="text-emerald-600 text-xs mt-0.5">Our team will review within 1–2 business days. You&apos;ll be notified by email.</p>
            </div>
          </div>
        )}

        {(!verification || canResubmit) && !success && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="p-7">

              <h2 className="text-base font-bold text-slate-900 mb-1">
                {canResubmit ? 'Resubmit Your Documents' : 'Verify Your Business'}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Choose the option that best describes your business. All documents are stored securely.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Business type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Business Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { type: 'REGISTERED' as BizType, icon: '🏢', label: 'Registered Company', sub: 'Has a registration certificate' },
                      { type: 'INFORMAL' as BizType, icon: '🏪', label: 'SME / Sole Trader', sub: 'No formal registration' },
                    ]).map(({ type, icon, label, sub }) => (
                      <button key={type} type="button" onClick={() => setBizType(type)}
                        className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                          bizType === type
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-slate-200 text-slate-500 hover:border-amber-200'
                        }`}
                      >
                        <span className="text-xl block mb-1">{icon}</span>
                        <p className="text-sm font-bold leading-tight">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* REGISTERED fields */}
                {bizType === 'REGISTERED' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Registration Number <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="e.g. RC123456"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
                    </div>
                    <FileDropZone
                      label="Company Registration Certificate"
                      hint="JPEG, PNG, WebP or PDF — max 10 MB"
                      file={regFile} preview={regPreview}
                      onFile={(f) => { setRegFile(f); makePreview(f, setRegPreview); }}
                      onClear={() => { setRegFile(null); setRegPreview(null); }}
                    />
                  </>
                )}

                {/* INFORMAL fields */}
                {bizType === 'INFORMAL' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">ID Document Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['PASSPORT', 'NATIONAL_ID'] as IdDocType[]).map((type) => (
                          <button key={type} type="button" onClick={() => setIdDocType(type)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                              idDocType === type
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-200 text-slate-500 hover:border-amber-200'
                            }`}
                          >
                            <span>{type === 'PASSPORT' ? '🛂' : '🪪'}</span>
                            {type === 'PASSPORT' ? 'Passport' : 'National ID'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <FileDropZone
                      label="ID Document"
                      hint="Clear photo of your passport or national ID — max 10 MB"
                      file={idFile} preview={idPreview}
                      onFile={(f) => { setIdFile(f); makePreview(f, setIdPreview); }}
                      onClear={() => { setIdFile(null); setIdPreview(null); }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name</label>
                        <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. GTBank"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Name</label>
                        <input type="text" value={bankAccName} onChange={(e) => setBankAccName(e.target.value)}
                          placeholder="As on bank records"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
                      </div>
                    </div>
                    <FileDropZone
                      label="Bank Statement (last 3 months)"
                      hint="PDF or image — max 10 MB"
                      file={stmtFile} preview={stmtPreview}
                      onFile={(f) => { setStmtFile(f); makePreview(f, setStmtPreview); }}
                      onClear={() => { setStmtFile(null); setStmtPreview(null); }}
                    />
                  </>
                )}

                {/* Privacy note */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Documents are encrypted and stored securely. They are only accessed by authorised Jorbex staff for verification purposes.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Submit for Verification
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
