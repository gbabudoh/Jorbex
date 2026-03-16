import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getSiteContent, upsertSiteContent } from '@/lib/siteContent';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'hero';

  const content = await getSiteContent(section);
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { section, updates } = body;

  if (!section || !updates) {
    return NextResponse.json({ error: 'Missing section or updates' }, { status: 400 });
  }

  await upsertSiteContent(section, updates, session!.user.id);
  return NextResponse.json({ success: true });
}
