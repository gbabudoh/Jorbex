"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface OfferDetails {
  companyName: string;
  candidateName: string;
  jobTitle: string;
  content: string; // HTML
  salary: string;
  currency: string;
  startDate: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export default function OfferPage() {
  const params = useParams();
  const token = params.token as string;
  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchOffer = async () => {
    try {
      const res = await fetch(`/api/offers/${token}`);
      if (!res.ok) throw new Error('Offer not found or expired');
      const data = await res.json();
      setOffer(data.offer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (status: 'accepted' | 'rejected') => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/offers/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error('Failed to update offer');

      if (status === 'accepted') {
        // Confetti removed for dependencies
        setOffer(prev => prev ? { ...prev, status: 'accepted' } : null);
      } else {
        setOffer(prev => prev ? { ...prev, status: 'rejected' } : null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center p-20">Loading offer...</div>;
  if (error) return <div className="text-center p-20 text-red-500 font-bold">{error}</div>;
  if (!offer) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="max-w-3xl w-full border-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <h1 className="text-3xl font-bold relative z-10">Job Offer</h1>
           <p className="text-blue-100 mt-2 relative z-10">from {offer.companyName}</p>
        </div>

        <CardContent className="p-8 space-y-8">
           <div className="flex flex-wrap justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
             <div>
               <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Position</p>
               <p className="text-xl font-bold text-gray-900 dark:text-white">{offer.jobTitle}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Salary</p>
               <p className="text-xl font-bold text-gray-900 dark:text-white">{offer.currency} {offer.salary}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Start Date</p>
               <p className="text-xl font-bold text-gray-900 dark:text-white">{new Date(offer.startDate).toLocaleDateString()}</p>
             </div>
           </div>

           <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
             <div dangerouslySetInnerHTML={{ __html: offer.content }} />
           </div>

           {offer.status === 'pending' ? (
             <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
               <Button 
                 className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg"
                 onClick={() => handleResponse('accepted')}
                 isLoading={processing}
               >
                 Accept Offer
               </Button>
               <Button 
                 variant="outline" 
                 className="flex-1 h-12 text-lg border-red-200 text-red-600 hover:bg-red-50"
                 onClick={() => handleResponse('rejected')}
                 isLoading={processing}
               >
                 Decline
               </Button>
             </div>
           ) : (
             <div className={`p-6 rounded-xl text-center ${
               offer.status === 'accepted' ? 'bg-green-50 text-green-800 border border-green-200' : 
               offer.status === 'rejected' ? 'bg-red-50 text-red-800 border border-red-200' :
               'bg-gray-100 text-gray-800'
             }`}>
               <h3 className="text-lg font-bold">
                 {offer.status === 'accepted' ? '🎉 Offer Accepted!' : 
                  offer.status === 'rejected' ? 'Offer Declined' : 
                  'Offer Expired'}
               </h3>
               {offer.status === 'accepted' && <p>The employer has been notified. Welcome aboard!</p>}
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
