'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
}

export default function ScheduleModal({ 
  isOpen, 
  onClose, 
  candidateId, 
  candidateName,
}: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    dateTime: '',
    type: 'virtual' as 'virtual' | 'physical',
    location: '',
    notes: '',
  });
  const [isScheduling, setIsScheduling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSchedule = async () => {
    if (!formData.dateTime || !formData.location) {
      setError('Please fill in Date/Time and Location');
      return;
    }

    setIsScheduling(true);
    setError('');
    try {
      const response = await fetch('/api/v1/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          ...formData
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setFormData({ dateTime: '', type: 'virtual', location: '', notes: '' });
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/60 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <Card className="relative w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 bg-white dark:bg-gray-950">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-[#0066FF]/10 rounded-full blur-2xl -mr-16 -mt-16" />
        
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Interview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Booking for <span className="text-purple-600 font-semibold">{candidateName}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Interview Scheduled!</h3>
              <p className="text-gray-600 dark:text-gray-400">The candidate has been notified of the invitation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meeting Date & Time</label>
                  <Input 
                    type="datetime-local"
                    className="rounded-xl"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interview Type</label>
                  <select 
                    className="w-full px-4 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-purple-500 outline-none transition-all text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'virtual' | 'physical' })}
                  >
                    <option value="virtual">Virtual (Online Link)</option>
                    <option value="physical">Physical (Address)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {formData.type === 'virtual' ? 'Meeting Link' : 'Office Address'}
                </label>
                <Input 
                  placeholder={formData.type === 'virtual' ? 'e.g. Google Meet, Zoom link' : 'e.g. Plot 24, Victoria Island, Lagos'}
                  className="rounded-xl"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes (Optional)</label>
                <Textarea 
                  placeholder="Additional instructions for the candidate..."
                  className="min-h-[100px] rounded-xl border-gray-200 dark:border-gray-800 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl"
                  onClick={onClose}
                  disabled={isScheduling}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg"
                  disabled={isScheduling}
                  onClick={handleSchedule}
                  isLoading={isScheduling}
                >
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
