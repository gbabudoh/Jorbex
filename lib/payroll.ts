import prisma from './prisma';

export interface PayrollSummary {
  employmentRecordId: string;
  candidateName: string;
  currency: string;
  regularMinutes: number;
  overtimeMinutes: number;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeRate: number;
  regularGross: number;
  overtimeGross: number;
  totalGross: number;
}

/**
 * Aggregates attendance data for an employment record and calculates gross pay.
 */
export async function calculateGrossEarnings(
  employmentRecordId: string,
  startDate: Date,
  endDate: Date,
  overtimeMultiplier = 1.5
): Promise<PayrollSummary> {
  // 1. Fetch relevant data
  const record = await prisma.employmentRecord.findUnique({
    where: { id: employmentRecordId },
    include: {
      candidate: { select: { name: true } },
      attendanceSessions: {
        where: {
          clockIn: { gte: startDate },
          clockOut: { lte: endDate, not: null },
        },
      },
    },
  });

  if (!record || record.payType !== 'HOURLY' || !record.hourlyRate) {
    throw new Error('Record is not an hourly employment record or missing rate');
  }

  // 2. Aggregate minutes
  const totals = record.attendanceSessions.reduce(
    (acc, session) => ({
      regular: acc.regular + session.totalActiveMinutes,
      overtime: acc.overtime + session.overtimeMinutes,
    }),
    { regular: 0, overtime: 0 }
  );

  // 3. Calculate currency amounts
  const regularHours  = totals.regular / 60;
  const overtimeHours = totals.overtime / 60;
  
  const hourlyRate   = record.hourlyRate;
  const overtimeRate = hourlyRate * overtimeMultiplier;

  const regularGross  = Number((regularHours * hourlyRate).toFixed(2));
  const overtimeGross = Number((overtimeHours * overtimeRate).toFixed(2));
  const totalGross    = Number((regularGross + overtimeGross).toFixed(2));

  return {
    employmentRecordId: record.id,
    candidateName:      record.candidate.name,
    currency:           record.currency,
    regularMinutes:     totals.regular,
    overtimeMinutes:    totals.overtime,
    regularHours:       Number(regularHours.toFixed(2)),
    overtimeHours:      Number(overtimeHours.toFixed(2)),
    hourlyRate,
    overtimeRate,
    regularGross,
    overtimeGross,
    totalGross,
  };
}

/**
 * Fetches summaries for all hourly employees under an employer for a period.
 */
export async function getEmployerPayrollPeriod(
  employerId: string,
  startDate: Date,
  endDate: Date
): Promise<PayrollSummary[]> {
  const records = await prisma.employmentRecord.findMany({
    where: {
      employerId,
      payType: 'HOURLY',
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  const summaries = await Promise.all(
    records.map(r => calculateGrossEarnings(r.id, startDate, endDate))
  );

  return summaries;
}
