import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const TYPE_LABELS: Record<string, string> = {
  GOVERNMENT: 'Government Internship Programme',
  UNIVERSITY: 'University Placement Programme',
  CORPORATE:  'Corporate Match Placement',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type, institutionName, country, city,
      contactName, contactTitle, email, phone,
      estimatedSize, notes,
    } = body;

    if (!type || !institutionName || !country || !email) {
      return NextResponse.json(
        { error: 'type, institutionName, country, and email are required' },
        { status: 400 },
      );
    }

    const typeLabel  = TYPE_LABELS[type] ?? type;
    const fromAddr   = process.env.SMTP_FROM ?? process.env.SMTP_USER;
    const salesEmail = 'programmes@jorbex.com';

    // ── Email to sales team ──────────────────────────────────
    await transporter.sendMail({
      from:    `"Jorbex Programmes" <${fromAddr}>`,
      to:      salesEmail,
      replyTo: email,
      subject: `[Programmes Enquiry] ${typeLabel} — ${institutionName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
          <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:28px 32px;border-radius:12px 12px 0 0">
            <h2 style="color:#fff;margin:0;font-size:20px">New Programme Enquiry</h2>
            <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">${typeLabel}</p>
          </div>
          <div style="background:#f8fafc;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 0;color:#64748b;width:160px">Institution</td><td style="padding:8px 0;font-weight:700">${institutionName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Programme Type</td><td style="padding:8px 0;font-weight:700">${typeLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Country</td><td style="padding:8px 0">${country}${city ? `, ${city}` : ''}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Contact Name</td><td style="padding:8px 0">${contactName ?? '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Title</td><td style="padding:8px 0">${contactTitle ?? '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0">${phone ?? '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Estimated Size</td><td style="padding:8px 0">${estimatedSize ?? '—'}</td></tr>
              ${notes ? `<tr><td style="padding:8px 0;color:#64748b;vertical-align:top">Notes</td><td style="padding:8px 0">${notes}</td></tr>` : ''}
            </table>
          </div>
        </div>
      `,
    });

    // ── Confirmation email to enquirer ───────────────────────
    await transporter.sendMail({
      from:    `"Jorbex Programmes" <${fromAddr}>`,
      to:      email,
      subject: `We received your enquiry — ${institutionName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
          <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:28px 32px;border-radius:12px 12px 0 0">
            <h2 style="color:#fff;margin:0;font-size:20px">Thank you, ${contactName ?? 'there'}!</h2>
            <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Jorbex Programmes</p>
          </div>
          <div style="background:#f8fafc;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
            <p style="font-size:15px;line-height:1.6">We've received your enquiry for the <strong>${typeLabel}</strong> on behalf of <strong>${institutionName}</strong>.</p>
            <p style="font-size:15px;line-height:1.6">A member of our programmes team will be in touch within <strong>1–2 business days</strong>.</p>
            <p style="font-size:13px;color:#64748b;margin-top:24px">If you have any urgent questions, reply to this email or contact us at <a href="mailto:programmes@jorbex.com" style="color:#2563eb">programmes@jorbex.com</a>.</p>
          </div>
        </div>
      `,
    });

    console.log('[Programmes enquiry sent]', { type, institution: institutionName, email });
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[Programmes enquiry error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
