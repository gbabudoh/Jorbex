'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SendTestModal from '@/components/shared/SendTestModal';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string;
  skills: string[];
  onboardingTestScore?: number;
  createdAt: string;
}

// Icon Components
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AwardIcon = () => (
  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LushBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-emerald-600/5 blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
  </div>
);

export default function SearchPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    expertise: '',
    skill: '',
    minScore: '',
  });
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    topSkills: [] as string[],
  });

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.expertise) params.append('expertise', filters.expertise);
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.minScore) params.append('minScore', filters.minScore);

      const response = await fetch(`/api/v1/candidates/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const candidatesList: Candidate[] = data.candidates || [];
        setCandidates(candidatesList);
        
        if (candidatesList.length > 0) {
          const avgScore = candidatesList.reduce((sum: number, c: Candidate) => sum + (c.onboardingTestScore || 0), 0) / candidatesList.length;
          const allSkills = candidatesList.flatMap((c: Candidate) => c.skills || []);
          const skillCounts: Record<string, number> = {};
          allSkills.forEach((skill: string) => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
          const topSkills = Object.entries(skillCounts)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([skill]) => skill);
          
          setStats({
            total: candidatesList.length,
            avgScore: Math.round(avgScore),
            topSkills,
          });
        } else {
          setStats({ total: 0, avgScore: 0, topSkills: [] });
        }
      }
    } catch (error) {
      console.error('Failed to search candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getSelectedCandidatesData = () => {
    return candidates
      .filter(c => selectedIds.has(c._id))
      .map(c => ({ id: c._id, name: c.name }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 80) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen relative bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <LushBackground />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-12 max-w-7xl relative z-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <Badge className="mb-4 px-3 py-1 bg-blue-600/10 text-blue-600 dark:text-blue-400 border-none rounded-full text-xs font-bold uppercase tracking-widest">
            Talent Discovery
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
            Hire the Best Professionals
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
            Search through our curated pool of verified talent. Filter by expertise, skills, and aptitude scores to find your next star performer.
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { 
              label: 'Total Candidates', 
              value: stats.total, 
              icon: <UsersIcon />, 
              gradient: 'from-blue-600/20 to-indigo-600/20',
              border: 'border-blue-500/20'
            },
            { 
              label: 'Avg Test Score', 
              value: `${stats.avgScore}%`, 
              icon: <AwardIcon />, 
              gradient: 'from-emerald-600/20 to-teal-600/20',
              border: 'border-emerald-500/20'
            },
            { 
              label: 'Top Skill', 
              value: stats.topSkills[0] || 'N/A', 
              icon: (
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ), 
              gradient: 'from-purple-600/20 to-fuchsia-600/20',
              border: 'border-purple-500/20'
            },
            { 
              label: 'New This Week', 
              value: candidates.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, 
              icon: <ClockIcon />, 
              gradient: 'from-rose-600/20 to-orange-600/20',
              border: 'border-rose-500/20'
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className={`relative overflow-hidden rounded-3xl border ${stat.border} bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/20 dark:shadow-none`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm">
                    {stat.icon}
                  </div>
                  <TrendingIcon />
                </div>
                <p className="text-3xl font-black mb-1">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-blue-500/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <SearchIcon />
                    </span>
                    Search Talent
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Fine-tune your search to find the perfect match</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-2xl h-12 px-6 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold gap-2"
                >
                  <FilterIcon />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Expertise</label>
                        <select
                          value={filters.expertise}
                          onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
                          className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium appearance-none"
                        >
                          <option value="">All Areas</option>
                          <option value="Finance">💼 Finance</option>
                          <option value="IT">💻 IT</option>
                          <option value="Marketing">📢 Marketing</option>
                          <option value="Sales">📊 Sales</option>
                          <option value="HR">👥 HR</option>
                          <option value="Operations">⚙️ Operations</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Key Skill</label>
                        <Input
                          placeholder="e.g. React, Python"
                          value={filters.skill}
                          onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                          className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-blue-600 transition-all px-5 font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Min. Score</label>
                        <Input
                          type="number"
                          placeholder="70"
                          value={filters.minScore}
                          onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                          className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-blue-600 transition-all px-5 font-medium"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button 
                          onClick={handleSearch} 
                          isLoading={isLoading} 
                          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] gap-3"
                        >
                          <SearchIcon />
                          Search Now
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Results Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'} Found
              </h2>
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {filters.expertise || filters.skill || filters.minScore ? 'Showing filtered results matching your criteria' : 'Explore all of our verified high-performing talent'}
            </p>
          </div>
          <div className="flex gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-md border border-slate-200 dark:border-slate-700">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              className={`rounded-xl transition-all border-none ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              className={`rounded-xl transition-all border-none ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </Button>
          </div>
        </motion.div>

        {/* Candidates Grid/List */}
        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 animate-pulse">Searching the talent pool...</p>
          </motion.div>
        ) : candidates.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-500/5">
              <CardContent className="py-24 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No match discovered</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium">We couldn&apos;t find any candidates matching your current filters. Try relaxing your criteria.</p>
                <Button 
                  variant="outline" 
                  className="rounded-2xl h-12 px-8 border-2 font-bold hover:bg-slate-50 dark:hover:bg-slate-800" 
                  onClick={() => {
                    setFilters({ expertise: '', skill: '', minScore: '' });
                    handleSearch();
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8' : 'space-y-6'}>
            {candidates.map((candidate) => (
              viewMode === 'grid' ? (
                // Redesigned Grid View
                <motion.div
                  key={candidate._id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[2.5rem] opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />
                  
                  <Card 
                    className="relative border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500/30 transition-all duration-500 cursor-pointer"
                    onClick={() => router.push(`/employer/candidates/${candidate._id}`)}
                  >
                    <div className="p-8">
                      {/* Avatar and Info Header */}
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div 
                            className="relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(candidate._id);
                            }}
                          >
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-600/20 transform group-hover:rotate-6 transition-transform">
                              {candidate.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedIds.has(candidate._id) 
                                ? 'bg-blue-600 border-blue-600 text-white scale-110' 
                                : 'bg-white border-slate-200 text-transparent scale-100 group-hover:border-blue-400'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {candidate.name}
                            </h3>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{candidate.expertise}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black text-[10px] uppercase tracking-tighter">
                          Verified
                        </Badge>
                      </div>

                      {/* Aptitude Score Section */}
                      {candidate.onboardingTestScore && (
                        <div className="mb-8 p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Aptitude Master</span>
                            <span className={`text-lg font-black ${getScoreColor(candidate.onboardingTestScore).split(' ')[0]}`}>
                              {candidate.onboardingTestScore}%
                            </span>
                          </div>
                          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${candidate.onboardingTestScore}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full relative shadow-[0_0_10px_rgba(37,99,235,0.4)]`}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* Core Skills Tags */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {candidate.skills?.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 shadow-sm">
                            {skill}
                          </span>
                        ))}
                        {(candidate.skills?.length || 0) > 3 && (
                          <span className="px-3 py-1.5 rounded-xl bg-blue-600/5 text-blue-600 dark:text-blue-400 text-[10px] font-black border border-blue-600/10">
                            +{(candidate.skills?.length || 0) - 3}
                          </span>
                        )}
                      </div>

                      <Button
                        className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all group-hover:shadow-2xl shadow-slate-900/10 gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/employer/candidates/${candidate._id}`);
                        }}
                      >
                        View Full Profile
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                // Redesigned List View
                <motion.div
                  key={candidate._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card 
                    className="group relative border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500/30 transition-all duration-500 cursor-pointer"
                    onClick={() => router.push(`/employer/candidates/${candidate._id}`)}
                  >
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                        {/* Avatar and Basic Info */}
                        <div className="flex items-center gap-6 min-w-[280px]">
                          <div 
                            className="relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(candidate._id);
                            }}
                          >
                            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-600/20 group-hover:rotate-3 transition-transform">
                               {candidate.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedIds.has(candidate._id) 
                                ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg' 
                                : 'bg-white border-slate-200 text-transparent scale-100 group-hover:border-blue-400 shadow-md'
                            }`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                              {candidate.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{candidate.expertise}</p>
                              <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] py-0">VERIFIED</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Stats Grid */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
                          {/* Score Card */}
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Aptitude Score</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-xl font-black ${getScoreColor(candidate.onboardingTestScore || 0).split(' ')[0]}`}>
                                {candidate.onboardingTestScore || 0}%
                              </span>
                              <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${candidate.onboardingTestScore || 0}%` }}
                                  viewport={{ once: true }}
                                  className="h-full bg-blue-600"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Skills Tags */}
                          <div className="lg:col-span-1 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Core Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.skills?.slice(0, 2).map((skill) => (
                                <span key={skill} className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[9px] font-black text-slate-600 dark:text-slate-400">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="hidden sm:block space-y-2">
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Direct Contact</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{candidate.email}</p>
                          </div>

                          <div className="hidden sm:block space-y-2">
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Telephone</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{candidate.phone}</p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          className="w-full lg:w-auto px-8 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.05] transition-all group-hover:shadow-2xl shadow-slate-900/10 gap-2 shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/employer/candidates/${candidate._id}`);
                          }}
                        >
                          View Profile
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            ))}
          </div>
        )}
      </motion.div>

      {/* Sticky Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
          >
            <div className="bg-slate-900/90 dark:bg-slate-100/90 backdrop-blur-xl rounded-[2rem] p-4 flex items-center justify-between shadow-2xl border border-white/10 dark:border-slate-800/10">
              <div className="flex items-center gap-4 ml-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
                  {selectedIds.size}
                </div>
                <div>
                  <p className="text-white dark:text-slate-900 font-black text-sm uppercase tracking-wider">Candidates Selected</p>
                  <button 
                    onClick={() => setSelectedIds(new Set())}
                    className="text-blue-400 dark:text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsTestModalOpen(true)}
                  className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/30 gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Send Test
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SendTestModal 
        isOpen={isTestModalOpen}
        onClose={() => {
          setIsTestModalOpen(false);
          setSelectedIds(new Set());
        }}
        selectedCandidates={getSelectedCandidatesData()}
      />
    </div>
  );
}

