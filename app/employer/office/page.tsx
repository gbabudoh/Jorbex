'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Search, 
  MapPin, 
  Clock, 
  Video, 
  MoreVertical,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttendanceSession {
  id: string;
  clockIn: string;
  clockOut: string | null;
  status: 'ACTIVE' | 'IDLE' | 'ON_BREAK' | 'OFFLINE';
  ipAddress: string | null;
  updatedAt: string;
  employmentRecord: {
    id: string;
    candidate: {
      name: string;
      expertise: string;
    };
  };
}

export default function EmployerOfficePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'office' | 'payroll'>('office');
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/office/dashboard');
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch office sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayroll = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/office/payroll/summary');
      const data = await res.json();
      if (data.summaries) {
        setPayrollSummary(data.summaries);
      }
    } catch (err) {
      console.error('Failed to fetch payroll summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'office') {
      fetchSessions();
      const interval = setInterval(fetchSessions, 30000);
      return () => clearInterval(interval);
    } else {
      fetchPayroll();
    }
  }, [activeTab]);

  const finalizePayroll = async () => {
    if (!payrollSummary.length || isProcessing) return;
    setIsProcessing(true);
    try {
      const recordIds = payrollSummary.map(s => s.employmentRecordId);
      const now = new Date();
      const res = await fetch('/api/office/payroll/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordIds,
          year: now.getFullYear(),
          month: now.getMonth() + 1
        })
      });
      const data = await res.json();
      alert(`Payroll processed for ${data.results.filter((r: any) => r.success).length} employees!`);
      fetchPayroll();
    } catch (err) {
      console.error('Payroll finalization failed:', err);
      alert('Failed to finalize payroll. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.employmentRecord.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.employmentRecord.candidate.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = sessions.filter(s => !s.clockOut && s.status === 'ACTIVE').length;
  const idleCount = sessions.filter(s => !s.clockOut && s.status === 'IDLE').length;

  const formatDuration = (start: string) => {
    const diff = Date.now() - new Date(start).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-[#0066FF]" size={36} />
            Jorbex Office
          </h1>
          <p className="text-gray-500 font-medium max-w-xl">
            Real-time workforce command center. Monitor presence, manage remote compliance, and bridge the trust gap.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="px-4 py-2 text-center">
            <span className="block text-2xl font-bold text-emerald-600">{activeCount}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="px-4 py-2 text-center">
            <span className="block text-2xl font-bold text-amber-500">{idleCount}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Idle</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8">
        <button
          onClick={() => setActiveTab('office')}
          className={`px-8 py-4 font-bold text-sm tracking-tight transition-all relative ${
            activeTab === 'office' ? 'text-[#0066FF]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase size={18} />
            Virtual Office
          </div>
          {activeTab === 'office' && (
            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066FF] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-8 py-4 font-bold text-sm tracking-tight transition-all relative ${
            activeTab === 'payroll' ? 'text-[#0066FF]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard size={18} />
            Payroll Management
          </div>
          {activeTab === 'payroll' && (
            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066FF] rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'office' ? (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or expertise..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066FF] focus:border-transparent outline-none transition-all shadow-sm shadow-gray-100/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          Filters
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-3xl" />
          ))}
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSessions.map((s) => (
            <motion.div
              layout
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl p-6 shadow-sm border transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group ${
                !s.clockOut ? 'border-gray-100' : 'border-gray-50 opacity-75 grayscale-[0.5]'
              }`}
            >
              {/* Status Indicator */}
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-50">
                 <div className={`w-2 h-2 rounded-full ${
                  s.clockOut ? 'bg-gray-400' :
                  s.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 
                  s.status === 'IDLE' ? 'bg-amber-500' : 
                  'bg-blue-500'
                }`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                  {s.clockOut ? 'OFFLINE' : s.status}
                </span>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight pr-12">
                    {s.employmentRecord.candidate.name}
                  </h3>
                  <p className="text-sm font-medium text-[#0066FF]">{s.employmentRecord.candidate.expertise}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={16} />
                    <span>{s.clockOut ? `Closed at ${new Date(s.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `Active for ${formatDuration(s.clockIn)}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <MapPin size={14} />
                    <span className="truncate">{s.ipAddress || 'Location hidden'}</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors text-xs font-bold">
                    <Video size={14} /> Join Office
                  </button>
                  <button className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-xl transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
            <Users className="text-gray-300" size={32} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">No active sessions</h3>
          <p className="text-gray-500 text-sm">Once your employees clock-in to Jorbex Office, they will appear here.</p>
        </div>
      )}
</>
) : (
  /* Payroll View */
  <div className="space-y-6">
    <div className="bg-[#0066FF]/5 border border-[#0066FF]/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
          <Clock className="text-[#0066FF]" size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Finalize Current Cycle</h2>
          <p className="text-sm text-gray-500 font-medium">Review aggregated Jorbex Office sessions and push to Frappe ERP.</p>
        </div>
      </div>
      <button 
        onClick={finalizePayroll}
        disabled={isProcessing || !payrollSummary.length}
        className="px-8 py-4 bg-[#0066FF] hover:bg-[#0052cc] disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#0066FF]/20 flex items-center gap-3 active:scale-95"
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
        ) : (
          <CheckCircle size={20} />
        )}
        Process Payroll
      </button>
    </div>

    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Regular Hours</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Overtime</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Estimated Gross</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {payrollSummary.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-5">
                <div className="font-bold text-gray-900">{item.candidateName}</div>
                <div className="text-[10px] font-bold text-[#0066FF] uppercase tracking-tight">Hourly Contactor</div>
              </td>
              <td className="px-6 py-5 text-center">
                <span className="font-mono font-bold text-gray-700">{item.regularHours}h</span>
                <span className="text-[10px] text-gray-400 block tracking-tighter">{item.regularMinutes} mins tracked</span>
              </td>
              <td className="px-6 py-5 text-center">
                <span className={`font-mono font-bold ${item.overtimeHours > 0 ? 'text-rose-500' : 'text-gray-300'}`}>
                  {item.overtimeHours}h
                </span>
                {item.overtimeHours > 0 && (
                   <span className="text-[10px] text-rose-300 block tracking-tighter">1.5x Premium included</span>
                )}
              </td>
              <td className="px-6 py-5 text-right">
                <div className="font-bold text-gray-900">{item.currency} {item.totalGross.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Verified by JO</div>
              </td>
            </tr>
          ))}
          {!isLoading && payrollSummary.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <AlertCircle className="text-gray-300" size={32} />
                  <p className="text-gray-500 font-medium">No hours logged for the selected period.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
    </div>
  );
}
