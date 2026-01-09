'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  candidateRole: string;
}

export default function ContactModal({ 
  isOpen, 
  onClose, 
  candidateId, 
  candidateName,
  candidateRole
}: ContactModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    setError('');
    try {
      const response = await fetch(`/api/v1/candidates/${candidateId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setMessage('');
          setSuccess(false);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <Card className="relative w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/10 to-[#00D9A5]/10 rounded-full blur-2xl -mr-16 -mt-16" />
        
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Candidate</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Reach out to <span className="text-[#0066FF] font-semibold">{candidateName}</span> ({candidateRole})
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
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Message Sent!</h3>
              <p className="text-gray-600 dark:text-gray-400">The candidate will be notified of your message.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Message</label>
                <Textarea 
                  placeholder="Write a professional message to the candidate..."
                  className="min-h-[160px] rounded-xl border-gray-200 dark:border-gray-800 focus:ring-[#0066FF] focus:border-[#0066FF] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSending}
                />
                <p className="text-[10px] text-gray-400 mt-2">
                  Tip: Be clear and professional. Introduce your company and the role you&apos;re considering them for.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl text-gray-600 dark:text-gray-400"
                  onClick={onClose}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg disabled:opacity-50"
                  disabled={!message.trim() || isSending}
                  onClick={handleSendMessage}
                  isLoading={isSending}
                >
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
