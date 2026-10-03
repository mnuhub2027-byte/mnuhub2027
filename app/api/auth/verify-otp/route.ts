import { NextResponse } from 'next/server'
import { verifyResendOTP } from '@/lib/otp-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 })
    }

    const check = verifyResendOTP(email, token)

    if (!check.valid) {
      return NextResponse.json({ error: check.reason || 'Invalid OTP code' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'OTP verified successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
