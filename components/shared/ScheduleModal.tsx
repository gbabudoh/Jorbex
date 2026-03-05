'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useLanguage } from '@/lib/LanguageContext';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  employerId?: string;
}

export default function ScheduleModal(props: ScheduleModalProps) {
  const { 
    isOpen, 
    onClose, 
    candidateId, 
    candidateName,
    employerId: propEmployerId
  } = props;
  const { t } = useLanguage();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUser = session?.user as any;
  const employerId = propEmployerId || sessionUser?.id;
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'virtual' as 'virtual' | 'physical',
    location: '',
    notes: '',
    duration: 30,
    jobId: '',
    jobTitle: '',
    manualJob: false,
  });
  const [isScheduling, setIsScheduling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Jobs state
  const [jobs, setJobs] = useState<{ _id: string; title: string }[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Fetch jobs when modal opens
  useEffect(() => {
    const fetchJobs = async () => {
      const eId = employerId || null;
      
      if (!eId) {
        // console.warn('Cannot fetch jobs: Missing valid employerId');
        // Default to manual mode if no employerId or error
        setFormData(prev => ({ ...prev, manualJob: true })); 
        return;
      }

      setIsLoadingJobs(true);
      try {
        const res = await fetch(`/api/employer/jobs?employerId=${eId}`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
          // Auto-select first job if available
          if (data.jobs && data.jobs.length > 0) {
             setFormData(prev => ({ ...prev, jobId: data.jobs[0]._id, manualJob: false }));
          } else {
             // No jobs found, switch to manual
             setFormData(prev => ({ ...prev, manualJob: true }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch jobs', err);
        setFormData(prev => ({ ...prev, manualJob: true }));
      } finally {
        setIsLoadingJobs(false);
      }
    };

    if (isOpen) { 
       fetchJobs();
    }
  }, [isOpen, employerId]);

  const handleSchedule = async () => {
    // Validate Job Selection
    if (!formData.manualJob && !formData.jobId) {
       setError('Please select a Job Position');
       return;
    }
    if (formData.manualJob && !formData.jobTitle) {
       setError('Please enter a Job Title');
       return;
    }

    if (!formData.date || !formData.time || (formData.type === 'physical' && !formData.location)) {
      setError('Please fill in Date, Time, Duration, and Location (if physical)');
      return;
    }

    setIsScheduling(true);
    setError('');
    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch('/api/interviews/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          employerId,
          ...formData,
          dateTime: dateTime.toISOString(),
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setFormData({ date: '', time: '', type: 'virtual', location: '', notes: '', duration: 30, jobId: '', jobTitle: '', manualJob: false });
          setSuccess(false);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to schedule interview');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <Card className="relative w-full max-w-md border border-gray-200/60 dark:border-gray-800/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-gray-950 rounded-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/8 to-indigo-500/8 rounded-full blur-2xl -mr-12 -mt-12" />
        
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Schedule Interview</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  with <span className="text-purple-600 dark:text-purple-400 font-semibold">{candidateName}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors -mt-0.5 -mr-1 cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="py-10 text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Interview Scheduled!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">The candidate has been notified.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {error && (
                <div className="px-3 py-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Job Selection */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Job Position</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, manualJob: !formData.manualJob, jobId: '', jobTitle: '' })}
                    className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer"
                  >
                    {formData.manualJob ? 'Select from list' : 'Enter manually'}
                  </button>
                </div>
                
                {formData.manualJob ? (
                  <Input
                    placeholder="e.g. Senior Frontend Engineer"
                    className="rounded-lg w-full h-9 text-sm text-gray-900 dark:text-gray-100"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    required
                  />
                ) : (
                  <select
                    className="w-full px-3 h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                    value={formData.jobId}
                    onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                    required={!formData.manualJob}
                  >
                    <option value="" disabled>-- Select a Job --</option>
                    {isLoadingJobs ? (
                      <option disabled>Loading jobs...</option>
                    ) : jobs.length > 0 ? (
                      jobs.map(job => (
                        <option key={job._id} value={job._id}>{job.title}</option>
                      ))
                    ) : (
                      <option disabled>No active jobs found</option>
                    )}
                  </select>
                )}
              </div>

              {/* Date + Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</label>
                  <Input 
                    type="date"
                    className="rounded-lg h-9 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Time</label>
                  <Input 
                    type="time"
                    className="rounded-lg h-9 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              {/* Type + Duration Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Type</label>
                  <select 
                    className="w-full px-3 h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'virtual' | 'physical' })}
                  >
                    <option value="virtual">Virtual</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Duration</label>
                  <select 
                    className="w-full px-3 h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
              </div>

              {/* Platform / Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {formData.type === 'virtual' ? 'Platform' : 'Office Address'}
                </label>
                {formData.type === 'virtual' ? (
                  <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                    <svg className="w-3.5 h-3.5 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('interviews.video_interview')}</span>
                  </div>
                ) : (
                  <Input 
                    placeholder="e.g. Plot 24, Victoria Island, Lagos"
                    className="rounded-lg h-9 text-sm text-gray-900 dark:text-gray-100"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Notes <span className="normal-case text-gray-300 dark:text-gray-600">(optional)</span></label>
                <Textarea 
                  placeholder="Additional instructions for the candidate..."
                  className="min-h-[60px] max-h-[80px] rounded-lg border-gray-200 dark:border-gray-800 resize-none text-sm text-gray-900 dark:text-gray-100"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <Button 
                  variant="outline" 
                  className="flex-1 h-10 rounded-xl text-sm font-semibold cursor-pointer"
                  onClick={onClose}
                  disabled={isScheduling}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-[2] h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm font-semibold cursor-pointer"
                  disabled={isScheduling}
                  onClick={handleSchedule}
                  isLoading={isScheduling}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Meet
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
