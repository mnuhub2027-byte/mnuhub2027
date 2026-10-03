import { NextResponse } from 'next/server'
import { sendCustomEmail } from '@/lib/email'
import { sanitizeText } from '@/lib/security'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { to, subject, title, text, html, secretKey } = body

    // Basic API security check
    const adminSecret = process.env.ADMIN_EMAIL_SECRET
    if (adminSecret && secretKey !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 })
    }

    if (!to || (!subject && !title)) {
      return NextResponse.json(
        { error: 'Recipient (to) and Subject/Title are required fields' },
        { status: 400 }
      )
    }

    const emailSubject = sanitizeText(subject || title)
    const emailBody = sanitizeText(text || body)

    // Formatted HTML template for MNUHub university emails
    const formattedHtml =
      html ||
      `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; }
            .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 560px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: bold; color: #38bdf8; text-decoration: none; }
            .title { font-size: 20px; font-weight: bold; color: #ffffff; margin-bottom: 12px; }
            .content { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
            .footer { text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <span class="logo">MNU<span style="color: #0284c7;">Hub</span></span>
              <p style="font-size: 12px; color: #64748b; margin-top: 4px;">جامعة المنصورة الأهلية — Mansoura National University</p>
            </div>
            <h2 class="title">${emailSubject}</h2>
            <div class="content">
              <p>${emailBody}</p>
            </div>
            <div class="footer">
              <p>هذا إشعار رسمي آلي صادرة عن منصة الأنشطة الطلابية بجامعة المنصورة الأهلية.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await sendCustomEmail({
      to,
      subject: emailSubject,
      html: formattedHtml,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
