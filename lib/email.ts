import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const resendApiKey = process.env.RESEND_API_KEY
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS

export const resend = resendApiKey ? new Resend(resendApiKey) : null

export type SendEmailParams = {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendCustomEmail({
  to,
  subject,
  html,
  from = 'MNUHub Admin <onboarding@resend.dev>',
}: SendEmailParams) {
  // Option A: If Gmail/SMTP credentials exist, use Nodemailer (sends to ANY email address without domain restriction)
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      const info = await transporter.sendMail({
        from: `MNUHub <${smtpUser}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      })

      return { success: true, data: info }
    } catch (smtpErr: any) {
      console.error('[SMTP Email Error]:', smtpErr)
      return { success: false, error: smtpErr.message || 'Failed to send email via SMTP' }
    }
  }

  // Option B: Fallback to Resend API
  if (!resend) {
    console.warn('[Resend Email] RESEND_API_KEY is not set in environment variables.')
    return { success: false, error: 'RESEND_API_KEY is not configured in .env' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('[Resend Email Error]:', error)
      return { success: false, error: error.message || 'Failed to send email via Resend' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('[Resend Email Error]:', error)
    return { success: false, error: error.message || 'Failed to send email via Resend' }
  }
}
