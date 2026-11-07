import { Resend } from 'resend';

let resendClient = null;
function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}
const NOTIFY_EMAIL = process.env.FORWARD_TO_EMAIL || 'spendlore@gmail.com';
const FROM_EMAIL = process.env.FORWARD_FROM_EMAIL || 'info@spendlore.gr';

/**
 * Escapes HTML characters to prevent rendering issues and injection.
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips Greek accent marks (τόνοι) when converting text to uppercase.
 * In Greek monotonic orthography, all-caps words never have accent marks.
 * Preserves diaeresis/dialytika (διαλυτικά) to maintain correct pronunciation.
 */
export function stripGreekAccents(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u0307\u0309-\u036f]/g, '')
    .normalize('NFC')
    .toUpperCase();
}

/**
 * Normalizes and formats the app version string cleanly.
 * Prevents redundant prefixes such as "vΈκδοση 1.1.37".
 */
export function formatAppVersion(raw) {
  if (!raw) return 'N/A';
  const trimmed = String(raw).trim();
  if (!trimmed) return 'N/A';
  if (trimmed.startsWith('Έκδοση') || trimmed.startsWith('Version')) {
    return trimmed;
  }
  if (trimmed.startsWith('v') || trimmed.startsWith('V')) {
    return trimmed;
  }
  return `v${trimmed}`;
}

/**
 * Generates an executive, light-theme email template for Spendlore support tickets.
 * Bulletproof inline styles ensure compatibility across Gmail, Apple Mail, Outlook and Webmail.
 */
export function generateTicketEmailHtml({
  ticketId,
  typeLabel,
  sender,
  userName,
  appVersion,
  priority
}) {
  const isHighPriority = String(priority).toLowerCase() === 'high';
  const priorityText = isHighPriority
    ? 'ΥΨΗΛΗ (HIGH)'
    : (priority && String(priority).toLowerCase() !== 'normal'
        ? stripGreekAccents(priority)
        : 'ΚΑΝΟΝΙΚΗ (NORMAL)');
  const priorityStyle = isHighPriority
    ? 'background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;'
    : 'background-color: #f1f5f9; color: #334155; border: 1px solid #e2e8f0;';

  const cleanVersion = formatAppVersion(appVersion);
  const escapedTypeLabel = escapeHtml(typeLabel);
  const escapedSender = escapeHtml(sender);
  const escapedUserName = escapeHtml(userName);
  const escapedCleanVersion = escapeHtml(cleanVersion);
  const escapedTicketId = escapeHtml(ticketId);

  const canReply = sender && sender.includes('@') && !sender.includes('Ανώνυμος');

  return `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Spendlore Ticket] ${escapedTypeLabel}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #f8fafc; margin: 0; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px 20px 28px; border-bottom: 1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #64748b; margin-bottom: 6px;">
                      SPENDLORE &bull; ΚΕΝΤΡΟ ΥΠΟΣΤΗΡΙΞΗΣ
                    </div>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                      Νέο Αίτημα Υποστήριξης
                    </h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 6px; ${priorityStyle}">
                      ${priorityText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Metadata Box -->
          <tr>
            <td style="padding: 20px 28px 16px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: separate;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; width: 140px; border-bottom: 1px solid #e2e8f0;">Κατηγορία</td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${escapedTypeLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Email Χρήστη</td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
                    ${canReply ? `<a href="mailto:${escapedSender}" style="color: #0f172a; text-decoration: underline;">${escapedSender}</a>` : escapedSender}
                    ${escapedUserName ? `<span style="color: #64748b; font-weight: 400; margin-left: 6px;">(${escapedUserName})</span>` : ''}
                  </td>
                </tr>
                ${cleanVersion !== 'N/A' ? `
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; ${ticketId ? 'border-bottom: 1px solid #e2e8f0;' : ''}">Έκδοση Εφαρμογής</td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #334155; font-weight: 500; ${ticketId ? 'border-bottom: 1px solid #e2e8f0;' : ''}">${escapedCleanVersion}</td>
                </tr>
                ` : ''}
                ${ticketId ? `
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600;">Ticket ID</td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #475569; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapedTicketId}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Message Area -->
          <tr>
            <td style="padding: 8px 28px 24px 28px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #64748b; margin-bottom: 8px;">
                ΜΗΝΥΜΑ ΧΡΗΣΤΗ
              </div>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #0f172a; border-radius: 6px; padding: 16px 18px;">
                <div style="font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; word-break: break-word; font-family: inherit;">{{USER_MESSAGE}}</div>
              </div>
            </td>
          </tr>

          <!-- Action & Direct Reply Note -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                ${canReply ? `
                <tr>
                  <td style="padding-bottom: 14px;">
                    <a href="mailto:${escapedSender}?subject=Re: [Spendlore Ticket] ${escapedTypeLabel}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">
                      Απάντηση στον Χρήστη &rarr;
                    </a>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="font-size: 12px; line-height: 1.5; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 14px;">
                    Μπορείτε να πατήσετε απευθείας <strong>Απάντηση (Reply)</strong> στο πρόγραμμα αλληλογραφίας σας για να στείλετε απάντηση στον αποστολέα.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center;">
              <div style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Spendlore Financial Technologies &bull; Αυτόματη ειδοποίηση εισερχόμενου ticket<br>
                <a href="https://www.spendlore.gr" style="color: #64748b; text-decoration: underline;">spendlore.gr</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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

    const resend = getResendClient();
    if (!resend) {
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
    const cleanVersion = formatAppVersion(appVersion);

    const emailTemplate = generateTicketEmailHtml({
      ticketId,
      typeLabel,
      sender,
      userName,
      appVersion,
      priority
    });

    // Safely insert the escaped message into the template
    const finalHtml = emailTemplate.replace('{{USER_MESSAGE}}', escapeHtml(message));

    const result = await resend.emails.send({
      from: `Spendlore Support <${FROM_EMAIL}>`,
      to: [NOTIFY_EMAIL],
      reply_to: userEmail && userEmail.includes('@') ? userEmail : undefined,
      subject: `[Spendlore Ticket] ${typeLabel} από ${sender}`,
      html: finalHtml,
      text: `[Spendlore Ticket - ${typeLabel}]\n` +
            `Αποστολέας: ${sender}${userName ? ` (${userName})` : ''}\n` +
            `Προτεραιότητα: ${priority || 'normal'}\n` +
            `Έκδοση: ${cleanVersion}\n` +
            (ticketId ? `Ticket ID: ${ticketId}\n` : '') +
            `\n--- Μήνυμα Χρήστη ---\n${message}\n\n` +
            `Μπορείτε να απαντήσετε απευθείας σε αυτό το email.`
    });

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('Error sending ticket notification:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
