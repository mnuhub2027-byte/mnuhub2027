import { sendCustomEmail } from '@/lib/email'

export type OTPRecord = {
  email: string
  code: string
  expiresAt: number
  attempts: number
}

// Global server-side memory store for active OTP codes
const globalForOTP = global as unknown as { otpStore: Map<string, OTPRecord> }
export const otpStore = globalForOTP.otpStore || new Map<string, OTPRecord>()
if (process.env.NODE_ENV !== 'production') globalForOTP.otpStore = otpStore

/**
 * Generate a 6-digit numeric OTP and send it via Resend API instantly
 */
export async function sendResendOTP(email: string, fullName?: string) {
  const normalizedEmail = email.trim().toLowerCase()

  // Generate 6-digit numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 Minutes validity

  // Save in server store
  otpStore.set(normalizedEmail, {
    email: normalizedEmail,
    code,
    expiresAt,
    attempts: 0,
  })

  // Format branded HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; text-align: center; }
          .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px; max-width: 480px; margin: 0 auto; }
          .logo { font-size: 28px; font-weight: bold; color: #38bdf8; text-decoration: none; }
          .otp-box { background-color: #0f172a; border: 2px solid #0284c7; border-radius: 16px; padding: 16px 24px; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #38bdf8; margin: 24px auto; display: inline-block; font-family: monospace; }
          .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; }
          .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">MNU<span style="color: #0284c7;">Hub</span></div>
          <p class="subtitle">جامعة المنصورة الأهلية — Mansoura National University</p>
          <h3 style="font-size: 20px; color: #ffffff; margin-top: 20px;">رمز تفعيل الحساب الجامعي</h3>
          <p style="font-size: 14px; color: #94a3b8;">أهلاً ${fullName ? fullName : 'بك'}! استخدم رمز التحقق التالي لإكمال إعداد حسابك على منصة MNUHub:</p>
          <div class="otp-box">${code}</div>
          <p style="font-size: 12px; color: #94a3b8;">هذا الرمز صالِح لمدة 10 دقائق. يرجى عدم مشاركته مع أي شخص.</p>
          <div class="footer">
            <p>© 2026 MNUHub. المنصة المركزية للأنشطة الطلابية بجامعة المنصورة الأهلية.</p>
          </div>
        </div>
      </body>
    </html>
  `

  // Send via Resend API
  const result = await sendCustomEmail({
    to: normalizedEmail,
    subject: `رمز تفعيل حسابك في منصة MNUHub: ${code}`,
    html: htmlContent,
  })

  return { success: result.success, code, error: result.error }
}

/**
 * Verify if the 6-digit code matches the active stored OTP
 */
export function verifyResendOTP(email: string, token: string): { valid: boolean; reason?: string } {
  const normalizedEmail = email.trim().toLowerCase()
  const record = otpStore.get(normalizedEmail)

  if (!record) {
    return { valid: false, reason: 'لم يتم العثور على رمز تفعيل لهذا البريد. يرجى طلب رمز جديد.' }
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail)
    return { valid: false, reason: 'انتهت صلاحية رمز التحقق (10 دقائق). يرجى طلب رمز جديد.' }
  }

  record.attempts += 1
  if (record.attempts > 5) {
    otpStore.delete(normalizedEmail)
    return { valid: false, reason: 'تجاوزت الحد الأقصى للمحاولات الخاطئة. يرجى طلب رمز جديد.' }
  }

  if (record.code !== token.trim()) {
    return { valid: false, reason: 'رمز التحقق غير صحيح. يرجى التأكد من الرمز وإعادة المحاولة.' }
  }

  // Success: Clear OTP token
  otpStore.delete(normalizedEmail)
  return { valid: true }
}
