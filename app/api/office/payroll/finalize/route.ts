import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateGrossEarnings } from '@/lib/payroll';
import { generateSalarySlipWithEarnings } from '@/lib/frappe';

/**
 * POST: Finalize payroll for a specific set of employees and push to Frappe
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recordIds, year, month } = await req.json();

    if (!recordIds || !Array.isArray(recordIds) || !year || !month) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const results = [];

    for (const recordId of recordIds) {
      try {
        // 1. Fetch record to get Frappe Employee Name
        const record = await prisma.employmentRecord.findUnique({
          where: { id: recordId },
        });

        if (!record || record.employerId !== session.user.id || !record.frappeEmployeeName) {
          results.push({ recordId, success: false, error: 'Invalid record or missing Frappe ID' });
          continue;
        }

        // 2. Calculate earnings
        const summary = await calculateGrossEarnings(recordId, startDate, endDate);

        // 3. Prepare Frappe earnings components
        const earnings = [
          {
            salary_component: 'Regular Hours (Jorbex Office)',
            amount: summary.regularGross,
          },
        ];

        if (summary.overtimeGross > 0) {
          earnings.push({
            salary_component: 'Overtime (Jorbex Office)',
            amount: summary.overtimeGross,
          });
        }

        // 4. Generate Slip in Frappe
        const slipId = await generateSalarySlipWithEarnings({
          frappeEmployeeName: record.frappeEmployeeName,
          year,
          month,
          earnings,
        });

        // 5. Update local record (Optional: link slip)
        await prisma.employmentRecord.update({
          where: { id: recordId },
          data: {
            lastDisbursementAt: new Date(),
            lastDisbursementRef: slipId,
          },
        });

        results.push({ recordId, success: true, slipId, totalGross: summary.totalGross });
      } catch (innerError) {
        console.error(`Error processing payroll for ${recordId}:`, innerError);
        const msg = innerError instanceof Error ? innerError.message : 'Unknown error';
        results.push({ recordId, success: false, error: msg });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in payroll finalization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
