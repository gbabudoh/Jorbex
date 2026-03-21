"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface Application {
  id:    string;
  jobId: string;
  job:   { title: string };
}

interface SendOfferModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  candidateId:   string;
  candidateName: string;
}

export default function SendOfferModal({ isOpen, onClose, candidateId, candidateName }: SendOfferModalProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps]   = useState(false);

  const [formData, setFormData] = useState({
    salary:    '',
    currency:  'NGN',
    startDate: '',
    content:   `<p>Dear ${candidateName},</p><p>We are pleased to offer you the position...</p>`,
    jobId:     '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  // Fetch this candidate's applications with the employer when modal opens
  useEffect(() => {
    if (!isOpen || !candidateId) return;
    setLoadingApps(true);
    fetch(`/api/employer/applications?candidateId=${candidateId}`)
      .then(r => r.json())
      .then(d => {
        const apps: Application[] = d.applications ?? [];
        setApplications(apps);
        // Auto-select if only one application
        if (apps.length === 1) {
          setFormData(prev => ({ ...prev, jobId: apps[0].jobId }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingApps(false));
  }, [isOpen, candidateId]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');
    if (!formData.jobId) {
      setError('Please select the job position for this offer.');
      return;
    }
    if (!formData.salary || !formData.startDate) {
      setError('Please fill in salary and start date.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/offers/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          candidateId,
          jobId:     formData.jobId,
          salary:    formData.salary,
          currency:  formData.currency,
          startDate: formData.startDate,
          content:   formData.content,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send offer');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setError('');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />

      <Card className="relative w-full max-w-2xl border-0 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Send Offer to {candidateName}</h2>

          {success ? (
            <div className="text-center py-10 text-green-600">
              <h3 className="text-2xl font-bold">Offer Sent! 🎉</h3>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Job selector */}
              <div>
                <label className="text-sm font-semibold block mb-1">
                  Job Position <span className="text-red-500">*</span>
                </label>
                {loadingApps ? (
                  <p className="text-sm text-gray-400">Loading applications...</p>
                ) : applications.length === 0 ? (
                  <p className="text-sm text-red-500">
                    No applications found from this candidate. You can only send offers to candidates who have applied to your jobs.
                  </p>
                ) : (
                  <select
                    value={formData.jobId}
                    onChange={e => setFormData({ ...formData, jobId: e.target.value })}
                    className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[#0066FF] transition-colors"
                  >
                    <option value="">Select a position...</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.jobId}>
                        {app.job.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-1">Salary Amount <span className="text-red-500">*</span></label>
                  <Input
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. 250000"
                    className="text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[#0066FF] transition-colors"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="KES">KES (KSh)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GHS">GHS (₵)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">Start Date <span className="text-red-500">*</span></label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">Offer Letter Content (HTML supported)</label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="h-40 font-mono text-sm text-gray-900 dark:text-gray-100"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={loading}
                  disabled={applications.length === 0 || loadingApps}
                >
                  Send Offer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
