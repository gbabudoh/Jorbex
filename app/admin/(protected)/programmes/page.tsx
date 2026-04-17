'use client';

import { useState, useEffect, useCallback } from 'react';

interface Enquiry {
  id: string;
  type: 'GOVERNMENT' | 'UNIVERSITY' | 'CORPORATE';
  institutionName: string;
  country: string;
  city: string | null;
  contactName: string | null;
  contactTitle: string | null;
  email: string;
  phone: string | null;
  estimatedSize: string | null;
  notes: string | null;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface Portal {
  id: string;
  type: 'GOVERNMENT' | 'UNIVERSITY' | 'CORPORATE';
  institutionName: string;
  slug: string;
  country: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  _count: { users: number; programmes: number };
}

interface Stats {
  pendingEnquiries: number;
  totalEnquiries: number;
  activePortals: number;
  totalPortals: number;
}

const TYPE_COLORS = {
  GOVERNMENT: 'bg-blue-100 text-blue-700 border-blue-200',
  UNIVERSITY: 'bg-purple-100 text-purple-700 border-purple-200',
  CORPORATE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700',
  REVIEWING: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-red-100 text-red-700',
};

export default function AdminProgrammesPage() {
  const [tab, setTab] = useState<'enquiries' | 'portals'>('enquiries');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dataRes, statsRes] = await Promise.all([
        fetch('/api/admin/programmes'),
        fetch('/api/admin/programmes/stats'),
      ]);

      if (dataRes.ok) {
        const data = await dataRes.json();
        setEnquiries(data.enquiries || []);
        setPortals(data.portals || []);
      }

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch programmes data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (enquiryId: string, action: 'approve' | 'reject' | 'reviewing', rejectReason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/programmes/enquiry/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectReason }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === 'approve' && data.credentials) {
          alert(`Portal created!\n\nLogin URL: ${data.credentials.loginUrl}\nEmail: ${data.credentials.email}\nTemp Password: ${data.credentials.tempPassword}\n\nPlease share these credentials with the institution.`);
        }
        setSelectedEnquiry(null);
        fetchData();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Programme Management</h1>
        <p className="text-slate-500 text-sm mt-1">Review applications and manage institutional portals</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingEnquiries}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enquiries</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalEnquiries}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Portals</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.activePortals}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Portals</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalPortals}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('enquiries')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            tab === 'enquiries'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setTab('portals')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            tab === 'portals'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Portals ({portals.length})
        </button>
      </div>

      {/* Enquiries Tab */}
      {tab === 'enquiries' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Institution</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Country</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No enquiries yet
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 text-sm">{e.institutionName}</p>
                      <p className="text-xs text-slate-500">{e.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${TYPE_COLORS[e.type]}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{e.contactName || '—'}</p>
                      <p className="text-xs text-slate-400">{e.contactTitle || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {e.country}{e.city ? `, ${e.city}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[e.status]}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedEnquiry(e)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Portals Tab */}
      {tab === 'portals' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Institution</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Users</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Programmes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {portals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No portals yet
                  </td>
                </tr>
              ) : (
                portals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 text-sm">{p.institutionName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${TYPE_COLORS[p.type]}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">{p.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p._count.users}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p._count.programmes}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedEnquiry.institutionName}</h2>
                  <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase border mt-2 ${TYPE_COLORS[selectedEnquiry.type]}`}>
                    {selectedEnquiry.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Contact</p>
                  <p className="text-slate-900 font-medium">{selectedEnquiry.contactName || '—'}</p>
                  <p className="text-slate-500 text-xs">{selectedEnquiry.contactTitle || ''}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Email</p>
                  <p className="text-slate-900">{selectedEnquiry.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Phone</p>
                  <p className="text-slate-900">{selectedEnquiry.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Location</p>
                  <p className="text-slate-900">{selectedEnquiry.country}{selectedEnquiry.city ? `, ${selectedEnquiry.city}` : ''}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Est. Size</p>
                  <p className="text-slate-900">{selectedEnquiry.estimatedSize || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[selectedEnquiry.status]}`}>
                    {selectedEnquiry.status}
                  </span>
                </div>
              </div>

              {selectedEnquiry.notes && (
                <div>
                  <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Notes</p>
                  <p className="text-slate-700 text-sm bg-slate-50 rounded-lg p-3">{selectedEnquiry.notes}</p>
                </div>
              )}
            </div>

            {selectedEnquiry.status === 'PENDING' || selectedEnquiry.status === 'REVIEWING' ? (
              <div className="p-6 border-t border-slate-200 flex gap-3">
                {selectedEnquiry.status === 'PENDING' && (
                  <button
                    onClick={() => handleAction(selectedEnquiry.id, 'reviewing')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Mark Reviewing
                  </button>
                )}
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason (optional):');
                    handleAction(selectedEnquiry.id, 'reject', reason || undefined);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selectedEnquiry.id, 'approve')}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Processing...' : 'Approve & Create Portal'}
                </button>
              </div>
            ) : (
              <div className="p-6 border-t border-slate-200">
                <p className="text-center text-slate-500 text-sm">
                  This enquiry has been {selectedEnquiry.status.toLowerCase()}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
