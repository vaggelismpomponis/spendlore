import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = process.env.FORWARD_TO_EMAIL || 'spendlore@gmail.com';
const FROM_EMAIL = process.env.FORWARD_FROM_EMAIL || 'info@spendlore.gr';

/**
 * Ticket Notification Dispatcher
 * 
 * Sends an email notification to spendlore@gmail.com whenever a user
 * submits a feedback/support/bug ticket from inside the application.
 */
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticketId, type, message, userEmail, userName, appVersion, priority } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not configured in environment, skipping email notification');
      return res.status(200).json({ warning: 'RESEND_API_KEY not configured, skipped email' });
    }

    const typeLabels = {
      support: 'Τεχνική Υποστήριξη',
      bug: 'Αναφορά Σφάλματος',
      idea: 'Πρόταση Λειτουργίας',
      other: 'Γενικό Σχόλιο'
    };
    const typeLabel = typeLabels[type] || type || 'Υποστήριξη';
    const sender = userEmail || 'Ανώνυμος χρήστης';

    const result = await resend.emails.send({
      from: `Spendlore Support <${FROM_EMAIL}>`,
      to: [NOTIFY_EMAIL],
      reply_to: userEmail && userEmail.includes('@') ? userEmail : undefined,
      subject: `[Spendlore Ticket] ${typeLabel} από ${sender}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
            <div style="display: inline-block; background: #7c3aed; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; margin-bottom: 8px;">
              Spendlore App Ticket
            </div>
            <h2 style="margin: 0; font-size: 20px; color: #ffffff;">Νέο Αίτημα Υποστήριξης</h2>
          </div>
          
          <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 16px; margin-bottom: 20px; line-height: 1.6;">
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;"><strong>Κατηγορία:</strong> <span style="color: #c4b5fd; font-weight: bold;">${typeLabel}</span></p>
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;"><strong>Email Χρήστη:</strong> <span style="color: #ffffff;">${sender}</span></p>
            ${userName ? `<p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;"><strong>Όνομα:</strong> <span style="color: #ffffff;">${userName}</span></p>` : ''}
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;"><strong>Προτεραιότητα:</strong> <span style="color: ${priority === 'high' ? '#f87171' : '#60a5fa'}; font-weight: bold;">${priority || 'normal'}</span></p>
            ${ticketId ? `<p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;"><strong>Ticket ID:</strong> <span style="font-family: monospace; color: #94a3b8;">${ticketId}</span></p>` : ''}
            ${appVersion ? `<p style="margin: 0; font-size: 13px; color: #94a3b8;"><strong>Έκδοση Εφαρμογής:</strong> <span style="color: #cbd5e1;">v${appVersion}</span></p>` : ''}
          </div>

          <div style="background: rgba(255,255,255,0.06); border-radius: 8px; padding: 18px; margin-bottom: 24px; border-left: 4px solid #7c3aed;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a78bfa; font-weight: bold; margin-bottom: 8px;">Μήνυμα Χρήστη:</div>
            <div style="font-size: 14px; line-height: 1.6; color: #ffffff; white-space: pre-wrap;">${message}</div>
          </div>

          <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
            💡 <em>Μπορείτε να πατήσετε απευθείας <strong>Απάντηση (Reply)</strong> σε αυτό το email για να στείλετε απάντηση στον αποστολέα.</em>
          </div>
        </div>
      `,
      text: `[Spendlore Ticket]\nΚατηγορία: ${typeLabel}\nΑποστολέας: ${sender}\nΠροτεραιότητα: ${priority}\nΈκδοση: ${appVersion || 'N/A'}\n\nΜήνυμα:\n${message}`
    });

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('Error sending ticket notification:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

