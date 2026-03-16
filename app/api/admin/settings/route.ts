import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getSiteContent, upsertSiteContent } from '@/lib/siteContent';

const DEFAULT_SETTINGS = {
  platform_name: 'Jorbex',
  support_email: 'support@jorbex.com',
  trial_days: '30',
  maintenance_mode: 'false',
};

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const stored = await getSiteContent('settings');
  const settings = { ...DEFAULT_SETTINGS, ...stored };
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  await upsertSiteContent('settings', body, session!.user.id);
  return NextResponse.json({ success: true });
}
