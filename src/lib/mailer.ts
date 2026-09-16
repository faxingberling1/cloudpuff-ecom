import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { generateVerificationEmailHtml } from './emailTemplate';

export interface SendVerificationEmailParams {
  to: string;
  name?: string;
  code: string;
  purpose?: string;
}

export async function sendVerificationEmail({
  to,
  name = 'there',
  code,
  purpose = 'Account Creation',
}: SendVerificationEmailParams): Promise<{ sent: boolean; simulated: boolean; messageId?: string; html: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  const htmlContent = generateVerificationEmailHtml({
    code,
    recipientEmail: to,
    recipientName: name,
    headerBannerUrl: 'https://files.catbox.moe/fhnjly.png',
    footerWaveUrl: 'https://files.catbox.moe/35cdtc.png',
  });

  // 1. PRIORITY: Send via RESEND
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);

      let fromAddress = process.env.EMAIL_FROM || 'CloudPuff <noreply@cloudpuff.neogentechnologies.com>';
      console.log(`[Resend Mailer] Attempting to send verification email to ${to} from ${fromAddress}...`);

      let response = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject: 'Verify Your Email Address',
        html: htmlContent,
      });

      // If custom domain is not yet verified on Resend, retry automatically with onboarding@resend.dev
      if (response.error) {
        console.warn(`[Resend Mailer Warning] Initial dispatch failed (${response.error.message}), retrying with onboarding@resend.dev...`);
        fromAddress = 'CloudPuff <onboarding@resend.dev>';
        response = await resend.emails.send({
          from: fromAddress,
          to: [to],
          subject: 'Verify Your Email Address',
          html: htmlContent,
        });
      }

      if (response.data && response.data.id) {
        console.log(`[Resend Mailer Success] Email delivered to ${to}! MessageId: ${response.data.id}`);
        return { sent: true, simulated: false, messageId: response.data.id, html: htmlContent };
      }

      if (response.error) {
        console.error('[Resend Mailer Error]', response.error);
      }
    } catch (resendErr) {
      console.error('[Resend Mailer Exception]', resendErr);
    }
  }

  // 2. SECONDARY: Send via Nodemailer SMTP if configured
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'CloudPuff <noreply@cloudpuff.neogentechnologies.com>',
        to,
        subject: 'Verify Your Email Address',
        text: `Almost There! Verify Your Email Address.\n\nHi ${name},\nTo complete your account setup and start your plushie adventure, please use the verification code below:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nDidn't request this? If you didn't create an account with Plushie, you can safely ignore this email.`,
        html: htmlContent,
      });

      console.log(`[SMTP Mailer] Verification email dispatched to ${to}. MessageId: ${info.messageId}`);
      return { sent: true, simulated: false, messageId: info.messageId, html: htmlContent };
    } catch (smtpErr) {
      console.error('[SMTP Mailer Error]', smtpErr);
    }
  }

  // 3. FALLBACK: Simulated delivery
  console.log(`[Simulated Mailer] Dispatched verification email to ${to} with code [${code}].`);
  return { sent: true, simulated: true, html: htmlContent };
}
