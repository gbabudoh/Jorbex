'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ContractData {
  id:            string;
  companyName:   string;
  candidateName: string;
  jobTitle:      string;
  content:       string;
  salary:        string;
  currency:      string;
  startDate:     string;
  status:        string;
  createdAt:     string;
  signature: {
    signedByName: string;
    signedAt:     string;
  } | null;
}

export default function ContractPage() {
  const params = useParams();
  const token  = params.token as string;

  const [data, setData]       = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/offers/${token}?includeSignature=true`)
      .then(r => r.json())
      .then(d => setData(d.offer))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin" />
    </div>
  );

  if (!data) return <div className="text-center p-20">Contract not found.</div>;

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#0066FF] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-[#0052CC] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save PDF
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 2cm; size: A4; }
        }
      `}</style>

      {/* Contract document */}
      <div className="max-w-3xl mx-auto px-8 py-12 bg-white text-gray-900 min-h-screen">

        {/* Header */}
        <div className="text-center border-b-2 border-gray-200 pb-8 mb-8">
          <div className="text-2xl font-black tracking-tight text-[#0066FF] mb-1">JORBEX</div>
          <h1 className="text-3xl font-black text-gray-900 mt-4">Employment Offer Agreement</h1>
          <p className="text-gray-500 mt-1 text-sm">Document reference: {data.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Parties */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Parties</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Employer</p>
              <p className="font-bold text-gray-900 text-lg">{data.companyName}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Candidate</p>
              <p className="font-bold text-gray-900 text-lg">{data.candidateName}</p>
            </div>
          </div>
        </section>

        {/* Key terms */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Terms</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Position</p>
              <p className="font-bold text-gray-900">{data.jobTitle}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Salary</p>
              <p className="font-bold text-gray-900">{data.currency} {data.salary} / month</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Start Date</p>
              <p className="font-bold text-gray-900">
                {new Date(data.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Offer content */}
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Offer Details</h2>
          <div
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </section>

        {/* Signature block */}
        <section className="border-t-2 border-gray-200 pt-8 mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Signatures</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* Employer signature */}
            <div>
              <div className="border-b-2 border-gray-300 h-12 mb-2" />
              <p className="font-bold text-gray-900">{data.companyName}</p>
              <p className="text-xs text-gray-400">Employer — Authorised Signatory</p>
            </div>

            {/* Candidate signature */}
            <div>
              {data.signature ? (
                <>
                  <div className="border-b-2 border-gray-800 h-12 mb-2 flex items-end pb-1">
                    <span
                      className="text-2xl text-gray-800"
                      style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
                    >
                      {data.signature.signedByName}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">{data.signature.signedByName}</p>
                  <p className="text-xs text-gray-400">
                    Candidate — Signed on {new Date(data.signature.signedAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </>
              ) : (
                <>
                  <div className="border-b-2 border-dashed border-gray-300 h-12 mb-2" />
                  <p className="font-bold text-gray-900">{data.candidateName}</p>
                  <p className="text-xs text-gray-400">Candidate — Awaiting signature</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>This document was generated by Jorbex on {new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
          <p className="mt-1">Jorbex — Africa&apos;s Talent Marketplace</p>
        </div>

      </div>
    </>
  );
}
