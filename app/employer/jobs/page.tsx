'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/employer/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    
    try {
      const response = await fetch(`/api/employer/jobs?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setJobs(jobs.filter(j => j._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Job Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your active job postings and track applications</p>
        </div>
        <Link href="/employer/jobs/create">
          <Button variant="primary" className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 font-bold px-6 py-2 rounded-xl cursor-pointer">
            Post New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card className="rounded-3xl border-0 shadow-xl">
          <CardContent className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No jobs posted yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Start reaching out to verified professionals by creating your first job listing today.</p>
            <Link href="/employer/jobs/create">
              <Button variant="primary" className="h-12 px-8 rounded-xl font-bold bg-[#0066FF] cursor-pointer">Create Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.title}</h2>
                    <Badge variant={job.status === 'active' ? 'success' : 'warning'}>{job.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5 underline decoration-slate-200 underline-offset-4">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                       {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 underline decoration-slate-200 underline-offset-4">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                       {job.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                       Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/employer/applications?jobId=${job._id}`}>
                    <Button variant="outline" className="rounded-xl font-bold text-blue-600 hover:bg-blue-50 border-blue-100 cursor-pointer">
                      View Applications
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="rounded-xl font-bold text-rose-500 hover:bg-rose-50 border-rose-100 cursor-pointer"
                    onClick={() => deleteJob(job._id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
