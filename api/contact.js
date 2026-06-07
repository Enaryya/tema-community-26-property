const { Resend } = require('resend');

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fname, lname, email, phone, interest, message } = req.body || {};

  if (!fname || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Property Enquiry <onboarding@resend.dev>',
      to: 'esther@feigrowthlab.com',
      reply_to: email,
      subject: `Property Enquiry — Tema Community 26 — ${esc(fname)} ${esc(lname)}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2a2a2a;">
          <div style="background:#1C2340;padding:28px 32px;border-radius:8px 8px 0 0;">
            <h2 style="color:#C4A253;margin:0;font-size:20px;font-weight:700;">New Property Enquiry</h2>
            <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">Tema Community 26 — Two-Storey Institutional Building</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:10px 0;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:11px;width:130px;border-bottom:1px solid #f3f4f6;">Name</td>
                <td style="padding:10px 0;font-weight:600;border-bottom:1px solid #f3f4f6;">${esc(fname)} ${esc(lname)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:11px;border-bottom:1px solid #f3f4f6;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><a href="mailto:${esc(email)}" style="color:#1C2340;font-weight:600;">${esc(email)}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:11px;border-bottom:1px solid #f3f4f6;">Phone</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">${esc(phone) || '<span style="color:#9ca3af;">Not provided</span>'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:11px;">Intended Use</td>
                <td style="padding:10px 0;">${esc(interest) || '<span style="color:#9ca3af;">Not specified</span>'}</td>
              </tr>
            </table>
            ${message ? `
            <div style="margin-top:20px;padding:16px 20px;background:#faf8f3;border-radius:8px;border:1px solid #e5e7eb;">
              <p style="margin:0 0 8px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:11px;">Message</p>
              <p style="margin:0;font-size:14px;line-height:1.65;white-space:pre-wrap;">${esc(message)}</p>
            </div>` : ''}
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
              <a href="mailto:${esc(email)}" style="display:inline-block;background:#C4A253;color:#1C2340;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;font-size:14px;">Reply to ${esc(fname)}</a>
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again or contact us directly.' });
  }
};
