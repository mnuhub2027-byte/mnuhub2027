import { NextResponse } from 'next/server'
import { sendResendOTP } from '@/lib/otp-service'
import { isValidEmail } from '@/lib/security'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, fullName } = body

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
    }

    const result = await sendResendOTP(email, fullName)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send OTP email via Resend' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully via Resend' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
