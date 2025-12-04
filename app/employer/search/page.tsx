'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

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
  const [candidates, setCandidates] = useState<any[]>([]);
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
        const candidatesList = data.candidates || [];
        setCandidates(candidatesList);
        
        // Calculate stats
        if (candidatesList.length > 0) {
          const avgScore = candidatesList.reduce((sum: number, c: any) => sum + (c.onboardingTestScore || 0), 0) / candidatesList.length;
          const allSkills = candidatesList.flatMap((c: any) => c.skills || []);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <UsersIcon />
                </div>
                <TrendingIcon />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.total}</p>
              <p className="text-blue-100 text-sm">Total Candidates</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AwardIcon />
                </div>
                <TrendingIcon />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.avgScore}%</p>
              <p className="text-green-100 text-sm">Avg Test Score</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1 truncate">{stats.topSkills[0] || 'N/A'}</p>
              <p className="text-purple-100 text-sm">Top Skill</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ClockIcon />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{candidates.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
              <p className="text-orange-100 text-sm">New This Week</p>
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
                className="hover:bg-blue-50 dark:hover:bg-blue-950/30"
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
                    className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg"
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
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
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
              <Button variant="outline" onClick={() => {
                setFilters({ expertise: '', skill: '', minScore: '' });
                handleSearch();
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {candidates.map((candidate) => (
              viewMode === 'grid' ? (
                // Grid View
                <Card key={candidate._id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden" onClick={() => router.push(`/employer/candidates/${candidate._id}`)}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/10 to-[#00D9A5]/10 rounded-full blur-2xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="relative p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D9A5] flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{candidate.name}</h3>
                          <Badge variant="success" className="ml-2 flex-shrink-0">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.expertise}</p>
                      </div>
                    </div>

                    {/* Score Bar */}
                    {candidate.onboardingTestScore && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Aptitude Score</span>
                          <span className={`text-lg font-bold px-2 py-0.5 rounded-lg ${getScoreColor(candidate.onboardingTestScore)}`}>
                            {candidate.onboardingTestScore}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#0066FF] to-[#00D9A5] transition-all duration-1000"
                            style={{ width: `${candidate.onboardingTestScore}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Top Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400">
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{candidate.phone}</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] group-hover:shadow-lg transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/employer/candidates/${candidate._id}`);
                      }}
                    >
                      View Full Profile
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // List View
                <Card key={candidate._id} className="border-0 shadow-lg hover:shadow-xl transition-all group cursor-pointer" onClick={() => router.push(`/employer/candidates/${candidate._id}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D9A5] flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{candidate.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.expertise}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {candidate.onboardingTestScore && (
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</p>
                                <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(candidate.onboardingTestScore)}`}>
                                  {candidate.onboardingTestScore}%
                                </span>
                              </div>
                            )}
                            <Badge variant="success">Verified</Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills?.slice(0, 3).map((skill: string) => (
                                <span key={skill} className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Email</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{candidate.email}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Phone</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{candidate.phone}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/employer/candidates/${candidate._id}`);
                        }}
                      >
                        View Profile
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

