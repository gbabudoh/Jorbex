import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEmployerPayrollPeriod } from '@/lib/payroll';

/**
 * GET: Fetch payroll summary for all staff under the current employer
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    
    // Default to current month
    const now = new Date();
    const start = searchParams.get('start') 
      ? new Date(searchParams.get('start')!) 
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = searchParams.get('end') 
      ? new Date(searchParams.get('end')!) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const summaries = await getEmployerPayrollPeriod(session.user.id, start, end);

    return NextResponse.json({ 
      period: { start, end },
      summaries 
    });
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
