'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
 
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
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AwardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function SearchPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Talent Search</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover and connect with verified professionals</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
            <CardContent className="relative p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <UsersIcon />
                </div>
                <div className="hidden xs:block">
                  <TrendingIcon />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold mb-1">{stats.total}</p>
              <p className="text-blue-100 text-[10px] md:text-sm uppercase tracking-wider font-semibold">Total Candidates</p>
            </CardContent>
          </Card>
 
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
            <CardContent className="relative p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AwardIcon />
                </div>
                <div className="hidden xs:block">
                  <TrendingIcon />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold mb-1">{stats.avgScore}%</p>
              <p className="text-green-100 text-[10px] md:text-sm uppercase tracking-wider font-semibold">Avg Test Score</p>
            </CardContent>
          </Card>
 
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
            <CardContent className="relative p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <p className="text-lg md:text-2xl font-bold mb-1 truncate">{stats.topSkills[0] || 'N/A'}</p>
              <p className="text-purple-100 text-[10px] md:text-sm uppercase tracking-wider font-semibold">Top Skill</p>
            </CardContent>
          </Card>
 
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
            <CardContent className="relative p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ClockIcon />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold mb-1">{candidates.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
              <p className="text-orange-100 text-[10px] md:text-sm uppercase tracking-wider font-semibold">New This Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <SearchIcon />
                  Search & Filter
                </CardTitle>
                <CardDescription>Find the perfect candidate for your role</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
              >
                <FilterIcon />
                <span className="ml-2">{showFilters ? 'Hide' : 'Show'} Filters</span>
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Expertise</label>
                  <select
                    value={filters.expertise}
                    onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 outline-none transition-all"
                  >
                    <option value="">All Expertise Areas</option>
                    <option value="Finance">💼 Finance</option>
                    <option value="IT">💻 IT</option>
                    <option value="Marketing">📢 Marketing</option>
                    <option value="Sales">📊 Sales</option>
                    <option value="HR">👥 HR</option>
                    <option value="Operations">⚙️ Operations</option>
                  </select>
                </div>
                <Input
                  label="Skill"
                  placeholder="e.g., React, Python, Excel"
                  value={filters.skill}
                  onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                />
                <Input
                  label="Min. Test Score"
                  type="number"
                  placeholder="70"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                />
                <div className="flex items-end">
                  <Button 
                    variant="primary" 
                    onClick={handleSearch} 
                    isLoading={isLoading} 
                    className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg cursor-pointer"
                  >
                    <SearchIcon />
                    <span className="ml-2">Search</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'} Found
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filters.expertise || filters.skill || filters.minScore ? 'Filtered results' : 'Showing all verified candidates'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              className="cursor-pointer"
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              className="cursor-pointer"
              onClick={() => setViewMode('list')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Candidates Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0066FF] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Searching candidates...</p>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No candidates found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search filters to find more candidates</p>
              <Button variant="outline" className="cursor-pointer" onClick={() => {
                setFilters({ expertise: '', skill: '', minScore: '' });
                handleSearch();
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6' : 'space-y-4'}>
            {candidates.map((candidate) => (
              viewMode === 'grid' ? (
                // Grid View
                <Card key={candidate._id} className="border-0 shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl" onClick={() => router.push(`/employer/candidates/${candidate._id}`)}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/10 to-[#00D9A5]/10 rounded-full blur-2xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="relative p-2.5 md:p-6">
                    <div className="flex flex-col xs:flex-row items-center xs:items-start gap-2 md:gap-4 mb-2 md:mb-4">
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D9A5] flex items-center justify-center text-white text-lg md:text-2xl font-bold shadow-lg flex-shrink-0">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 text-center xs:text-left">
                        <div className="flex flex-col mb-1">
                          <h3 className="font-bold text-sm md:text-lg text-gray-900 dark:text-white truncate group-hover:text-[#0066FF] transition-colors leading-tight">{candidate.name}</h3>
                          <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 truncate">{candidate.expertise}</p>
                        </div>
                        <Badge variant="success" className="text-[8px] md:text-[10px] px-1 md:px-1.5 py-0">
                          Verified
                        </Badge>
                      </div>
                    </div>
 
                    {/* Score (Compact for Mobile) */}
                    {candidate.onboardingTestScore && (
                      <div className="mb-2 md:mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] md:text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Aptitude</span>
                          <span className={`text-[10px] md:text-sm font-bold px-1.5 md:px-2 py-0.5 rounded-md md:rounded-lg ${getScoreColor(candidate.onboardingTestScore)}`}>
                            {candidate.onboardingTestScore}%
                          </span>
                        </div>
                        <div className="h-1 md:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#0066FF] to-[#00D9A5] transition-all duration-1000 shadow-[0_0_8px_rgba(0,102,255,0.4)]"
                            style={{ width: `${candidate.onboardingTestScore}%` }}
                          />
                        </div>
                      </div>
                    )}
 
                    {/* Skills (Compact for Mobile) */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 2).map((skill: string) => (
                            <span key={skill} className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[8px] md:text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-blue-50/50 dark:bg-blue-900/10 rounded text-[8px] md:text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              +{candidate.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
 
                    <Button
                      variant="primary"
                      className="w-full h-8 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] group-hover:shadow-lg transition-all text-[10px] md:text-sm font-bold cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/employer/candidates/${candidate._id}`);
                      }}
                    >
                      Profile
                      <svg className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // List View
                <Card key={candidate._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl" onClick={() => router.push(`/employer/candidates/${candidate._id}`)}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/5 to-[#00D9A5]/5 rounded-full blur-2xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                      {/* Avatar and Basic Info */}
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D9A5] flex items-center justify-center text-white text-xl md:text-3xl font-bold shadow-lg flex-shrink-0">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white truncate group-hover:text-[#0066FF] transition-colors mb-0.5">{candidate.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{candidate.expertise}</p>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                        {/* Score Section */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Score</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-black px-2 py-0.5 rounded-lg ${getScoreColor(candidate.onboardingTestScore || 0)}`}>
                              {candidate.onboardingTestScore}%
                            </span>
                            <Badge variant="success" className="text-[8px] uppercase font-bold tracking-tighter">Verified</Badge>
                          </div>
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills?.slice(0, 3).map((skill: string) => (
                              <span key={skill} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Email Section */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{candidate.email}</p>
                        </div>

                        {/* Phone Section */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{candidate.phone}</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="primary"
                        className="w-full md:w-auto px-8 h-12 md:h-14 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg transition-all font-bold text-base md:text-sm flex-shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/employer/candidates/${candidate._id}`);
                        }}
                      >
                        View Profile
                        <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

