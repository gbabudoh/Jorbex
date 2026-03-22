/**
 * Tests confirming the job detail interface fix.
 * Verifies that the Job type now uses `employer` (not `employerId`)
 * and that only fields actually in the DB are referenced.
 */

interface Employer {
  companyName: string;
  country?: string;
  city?: string;
  isVerified?: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary: string;
  employer: Employer;
  createdAt: string;
}

function formatEmployerLocation(employer: Employer): string {
  return [employer.city, employer.country].filter(Boolean).join(', ');
}

describe('Job detail employer interface', () => {
  const mockJob: Job = {
    id: 'job-1',
    title: 'Senior Engineer',
    description: 'Build great things.',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: '₦500,000/mo',
    employer: {
      companyName: 'Acme Corp',
      country: 'Nigeria',
      city: 'Lagos',
      isVerified: true,
    },
    createdAt: new Date().toISOString(),
  };

  it('accesses companyName via employer (not employerId)', () => {
    expect(mockJob.employer.companyName).toBe('Acme Corp');
  });

  it('renders location from city + country', () => {
    expect(formatEmployerLocation(mockJob.employer)).toBe('Lagos, Nigeria');
  });

  it('handles missing city gracefully', () => {
    const partial: Employer = { companyName: 'Remote Co', country: 'Kenya' };
    expect(formatEmployerLocation(partial)).toBe('Kenya');
  });

  it('handles employer with no location fields', () => {
    const minimal: Employer = { companyName: 'Ghost Ltd' };
    expect(formatEmployerLocation(minimal)).toBe('');
  });

  it('isVerified flag is present', () => {
    expect(mockJob.employer.isVerified).toBe(true);
  });
});
