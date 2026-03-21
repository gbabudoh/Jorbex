import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, institutionName, country, email, contactName } = body;

    if (!type || !institutionName || !country || !email) {
      return NextResponse.json({ error: 'type, institutionName, country, and email are required' }, { status: 400 });
    }

    // Log the enquiry — in production this would send an email / create a CRM record
    console.log('[Programmes enquiry]', {
      type,
      institution: institutionName,
      country,
      contact: contactName,
      email,
    });

    // TODO: send notification email to sales team and confirmation to enquirer

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Programmes enquiry error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
