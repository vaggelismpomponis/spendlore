import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FORWARD_TO = process.env.FORWARD_TO_EMAIL || 'spendlore@gmail.com';
const FORWARD_FROM = process.env.FORWARD_FROM_EMAIL || 'info@spendlore.gr';

/**
 * Resend Inbound Email Webhook Handler
 * 
 * Automatically captures incoming emails to info@spendlore.gr 
 * and forwards them to spendlore@gmail.com with attachments and reply-to headers.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!event || event.type !== 'email.received') {
      return res.status(200).json({ status: 'ignored', reason: 'Not an email.received event' });
    }

    const emailId = event.data?.email_id;
    if (!emailId) {
      return res.status(400).json({ error: 'Missing email_id in webhook event data' });
    }

    // 1. Primary approach: Built-in Resend forward helper
    try {
      const forwardResult = await resend.emails.receiving.forward({
        emailId,
        to: FORWARD_TO,
        from: FORWARD_FROM,
        passthrough: true
      });

      if (!forwardResult.error && forwardResult.data) {
        return res.status(200).json({
          success: true,
          mode: 'forward',
          forwardedTo: FORWARD_TO,
          data: forwardResult.data
        });
      }

      console.warn('resend.emails.receiving.forward returned error, falling back to manual retrieval:', forwardResult.error);
    } catch (fwdErr) {
      console.warn('resend.emails.receiving.forward exception, falling back:', fwdErr);
    }

    // 2. Fallback: Retrieve received email content and send with original reply_to
    const emailRes = await resend.emails.receiving.get(emailId);
    if (emailRes.error || !emailRes.data) {
      throw new Error(emailRes.error?.message || 'Could not retrieve received email from Resend');
    }

    const received = emailRes.data;
    const originalSender = received.from || event.data?.from || 'Unknown Sender';
    const originalSubject = received.subject || '(no subject)';

    const sendResult = await resend.emails.send({
      from: `Spendlore Support <${FORWARD_FROM}>`,
      to: [FORWARD_TO],
      reply_to: originalSender,
      subject: `[Spendlore Inbound] ${originalSubject}`,
      html: received.html || (received.text ? `<pre style="font-family:sans-serif;white-space:pre-wrap;">${received.text}</pre>` : '<p>Empty email body</p>'),
      text: received.text || undefined
    });

    if (sendResult.error) {
      throw new Error(sendResult.error.message);
    }

    return res.status(200).json({
      success: true,
      mode: 'fallback_send',
      forwardedTo: FORWARD_TO,
      id: sendResult.data?.id
    });

  } catch (error) {
    console.error('Inbound email webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

