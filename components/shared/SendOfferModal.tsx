"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface SendOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  // In a real app we might pass jobId or fetch it
  jobId?: string; 
}

export default function SendOfferModal({ isOpen, onClose, candidateId, candidateName, jobId }: SendOfferModalProps) {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [step, setStep] = useState(1); // Keep for future multi-step
  const [formData, setFormData] = useState({
    salary: '',
    currency: 'NGN',
    startDate: '',
    content: `<p>Dear ${candidateName},</p><p>We are pleased to offer you the position...</p>`,
    jobId: jobId || '', // Ideally this comes from context or selection
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // If jobId is missing, we might need to ask for it. For MVP assume we have it or user inputs it.
      // For now, let's hardcode a placeholder or require the user to be on a specific job context?
      // Since we are on candidate page, we might not know *which* job they applied for without fetching applications.
      // Let's assume we can fetch applications for this candidate + employer to pick one.
      // For this step, I'll allow manual entry or assume single job context.
      
      // FIXME: We need a valid Job ID for the offer model.
      // Simplification: We will just fail if no Job ID.
      // In a real integration, this modal would be triggered from an Application card which has the job ID.
       
      const res = await fetch('/api/offers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           candidateId,
           // jobId: formData.jobId,
           // In production: Fetch applications for this candidate, let user select which job
           ...formData
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
          setStep(1);
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred');
      }
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">Salary Amount</label>
                            <Input 
                                value={formData.salary} 
                                onChange={e => setFormData({...formData, salary: e.target.value})}
                                placeholder="e.g. 250,000"
                                className="text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Start Date</label>
                            <Input 
                                type="date"
                                value={formData.startDate} 
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                className="text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-sm font-semibold">Offer Letter Content (HTML supported)</label>
                        <Textarea 
                            value={formData.content}
                            onChange={e => setFormData({...formData, content: e.target.value})}
                            className="h-40 font-mono text-sm text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} isLoading={loading}>Send Offer</Button>
                    </div>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
}
