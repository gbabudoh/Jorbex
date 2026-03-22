'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AFRICAN_COUNTRIES } from '@/lib/locations';

type DocType = 'PASSPORT' | 'NATIONAL_ID';
type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Verification {
  id: string;
  docType: DocType;
  docNumber?: string;
  country: string;
  fileUrl: string;
  status: VerificationStatus;
  reviewNotes?: string;
  submittedAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; bg: string; icon: string }> = {
  PENDING:  { label: 'Under Review',  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: '⏳' },
  APPROVED: { label: 'Verified',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '✓' },
  REJECTED: { label: 'Rejected',      color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      icon: '✕' },
};

export default function CandidateVerifyPage() {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [docType, setDocType] = useState<DocType>('PASSPORT');
  const [docNumber, setDocNumber] = useState('');
  const [country, setCountry] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/verification/candidate')
      .then((r) => r.json())
      .then((d) => setVerification(d.verification))
      .finally(() => setLoading(false));
  }, []);

  const handleFile = (f: File) => {
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !country) return;

    setError('');
    setSubmitting(true);

    try {
      // Step 1: upload file
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'identity');
      const uploadRes = await fetch('/api/upload/doc', { method: 'POST', body: fd });
      if (!uploadRes.ok) {
        const u = await uploadRes.json();
        throw new Error(u.error || 'Upload failed');
      }
      const { url, key } = await uploadRes.json();

      // Step 2: submit verification record
      const res = await fetch('/api/verification/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, docNumber, country, fileUrl: url, fileKey: key }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Submission failed');
      }
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
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canResubmit = verification?.status === 'REJECTED';
  const isApproved = verification?.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/candidate/profile" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors mb-5 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Identity Verification</h1>
              <p className="text-slate-500 text-sm">Verify your identity to unlock all features</p>
            </div>
          </div>
        </div>

        {/* Existing verification status */}
        {verification && (
          <div className={`rounded-2xl border p-5 mb-6 ${STATUS_CONFIG[verification.status].bg}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{STATUS_CONFIG[verification.status].icon}</span>
              <div>
                <p className={`font-bold text-sm ${STATUS_CONFIG[verification.status].color}`}>
                  {STATUS_CONFIG[verification.status].label}
                </p>
                <p className="text-slate-500 text-xs">
                  Submitted {new Date(verification.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Document</p>
                <p className="text-slate-700 font-semibold">{verification.docType === 'PASSPORT' ? 'Passport' : 'National ID'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Issuing Country</p>
                <p className="text-slate-700 font-semibold">{verification.country}</p>
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
                <p className="text-sm text-emerald-700 font-semibold">Your identity is verified. No further action needed.</p>
              </div>
            )}
          </div>
        )}

        {/* Success banner after submission */}
        {success && !isApproved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-emerald-700 font-bold text-sm">Document submitted successfully</p>
              <p className="text-emerald-600 text-xs mt-0.5">Our team will review it within 1–2 business days. You&apos;ll be notified by email.</p>
            </div>
          </div>
        )}

        {/* Upload form — show if no submission yet, or if rejected */}
        {(!verification || canResubmit) && !success && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <div className="p-7">

              <h2 className="text-base font-bold text-slate-900 mb-1">
                {canResubmit ? 'Resubmit Your Document' : 'Upload Your ID Document'}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                We accept passports and national ID cards. Your document is stored securely and only viewed by Jorbex staff.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Document type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Document Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['PASSPORT', 'NATIONAL_ID'] as DocType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDocType(type)}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          docType === type
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-lg">{type === 'PASSPORT' ? '🛂' : '🪪'}</span>
                        {type === 'PASSPORT' ? 'Passport' : 'National ID'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issuing country */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Issuing Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all appearance-none"
                  >
                    <option value="">Select country...</option>
                    {AFRICAN_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Document number (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Document Number <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="A12345678"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  />
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Photo / Scan</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      file ? 'border-violet-400 bg-violet-50/50' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/30'
                    }`}
                  >
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="mx-auto max-h-40 rounded-lg object-contain" />
                    ) : file ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-violet-700 font-semibold">{file.name}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-slate-500 font-medium">Click or drag to upload</p>
                        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP or PDF — max 10 MB</p>
                      </>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                  </div>
                  {file && (
                    <button type="button" onClick={() => { setFile(null); setFilePreview(null); }}
                      className="mt-2 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      Remove file
                    </button>
                  )}
                </div>

                {/* Privacy note */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your document is encrypted and stored securely. It is only accessed by authorised Jorbex staff for verification and never shared with employers.
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

                <button
                  type="submit"
                  disabled={submitting || !file || !country}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
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

        {/* What happens next */}
        {!isApproved && (
          <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What happens next</p>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Document Submitted', desc: 'Your ID is securely uploaded and queued for review.' },
                { step: '2', title: 'Manual Review', desc: 'A Jorbex staff member checks your document — usually within 1–2 business days.' },
                { step: '3', title: 'Verified Badge', desc: 'Once approved, a verified badge appears on your profile, visible to employers and portals.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{step}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
