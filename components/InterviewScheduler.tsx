'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface InterviewSchedulerProps {
  employerId: string;
  candidateId: string;
  jobId?: string;
  applicationId?: string;
  onSuccess?: (interviewId: string) => void;
  onCancel?: () => void;
}

export default function InterviewScheduler({
  employerId,
  candidateId,
  jobId,
  applicationId,
  onSuccess,
  onCancel,
}: InterviewSchedulerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 30, // minutes
    type: 'virtual' as 'virtual' | 'physical',
    location: 'Remote', // Default for physical if changed
    notes: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const res = await fetch('/api/interviews/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employerId,
          candidateId,
          jobId,
          applicationId,
          dateTime: dateTime.toISOString(),
          duration: Number(formData.duration),
          type: formData.type,
          location: formData.type === 'virtual' ? 'Remote' : formData.location,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule interview');
      }

      if (onSuccess) {
        onSuccess(data.data.interviewId);
      } else {
        // Default action
        alert('Interview Scheduled Successfully!');
        router.refresh();
      }
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-lg w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Schedule Interview</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="virtual"
                checked={formData.type === 'virtual'}
                onChange={() => setFormData({ ...formData, type: 'virtual' })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Virtual (Jitsi)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="physical"
                checked={formData.type === 'physical'}
                onChange={() => setFormData({ ...formData, type: 'physical' })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">In-Person</span>
            </label>
          </div>
        </div>

        {formData.type === 'physical' && (
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
             <input
               type="text"
               required={formData.type === 'physical'}
               placeholder="123 Office Street, City"
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
               value={formData.location}
               onChange={(e) => setFormData({ ...formData, location: e.target.value })}
             />
           </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[80px]"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any instructions or context..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </form>
    </div>
  );
}
