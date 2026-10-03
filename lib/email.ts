import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

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
