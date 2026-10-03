'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Mail, ShieldCheck, Loader2, ShieldAlert, Lock, AlertTriangle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/language-switcher'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 Minutes
const MAX_RESENDS_PER_HOUR = 3

function VerifyContent() {
  const { language } = useLanguage()
  const isAr = language === 'ar'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [resendsCount, setResendsCount] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const supabase = createClient()

  // 1. Initialize Lockout & Cooldown Timer from persistent storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLock = localStorage.getItem('mnuhub_verify_locked_until')
      if (storedLock) {
        const lockTime = parseInt(storedLock, 10)
        if (Date.now() < lockTime) {
          setLockedUntil(lockTime)
        } else {
          localStorage.removeItem('mnuhub_verify_locked_until')
        }
      }

      const storedResends = localStorage.getItem('mnuhub_resends_count')
      if (storedResends) {
        setResendsCount(parseInt(storedResends, 10))
      }

      const storedCooldown = localStorage.getItem('mnuhub_verify_cooldown_until')
      let cooldownTime: number
      if (storedCooldown) {
        cooldownTime = parseInt(storedCooldown, 10)
      } else {
        cooldownTime = Date.now() + 60 * 1000
        localStorage.setItem('mnuhub_verify_cooldown_until', cooldownTime.toString())
      }

      const remaining = Math.max(0, Math.ceil((cooldownTime - Date.now()) / 1000))
      setTimer(remaining)
    }
  }, [])

  // 2. Persistent countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const storedCooldown = localStorage.getItem('mnuhub_verify_cooldown_until')
        if (storedCooldown) {
          const cooldownTime = parseInt(storedCooldown, 10)
          const remaining = Math.max(0, Math.ceil((cooldownTime - Date.now()) / 1000))
          setTimer(remaining)
        } else {
          setTimer(0)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const isLockedOut = lockedUntil !== null && Date.now() < lockedUntil
  const remainingLockMinutes = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / (60 * 1000)) : 0

  const handleChange = (index: number, value: string) => {
    if (isLockedOut) return
    const cleaned = value.replace(/[^0-9]/g, '')
    if (cleaned.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = cleaned
    setOtp(newOtp)

    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLockedOut) return
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`)
        prevInput?.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🛑 Check Device Lockout
    if (isLockedOut) {
      toast.error(
        isAr
          ? `الجهاز محظور مؤقتاً لحماية الحساب. يرجى الانتظار ${remainingLockMinutes} دقيقة.`
          : `Device temporarily locked. Please wait ${remainingLockMinutes} minutes.`
      )
      return
    }

    if (!email) {
      toast.error(isAr ? 'لم يتم العثور على بريد إلكتروني للتحقق منه.' : 'No email found to verify.')
      return
    }

    const token = otp.join('')
    if (token.length < 6) {
      toast.error(isAr ? 'يرجى إدخال الرمز المكون من 6 أرقام كاملاً.' : 'Please enter the complete 6-digit code.')
      return
    }

    setIsLoading(true)

    try {
      // 1. Verify 6-digit OTP via custom Resend OTP endpoint
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), token }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok || !verifyData.success) {
        // Fallback to Supabase verifyOtp
        const { error: supaErr } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup',
        })
        if (supaErr) {
          throw new Error(verifyData.error || supaErr.message || (isAr ? 'رمز التحقق غير صحيح.' : 'Invalid code.'))
        }
      }

      // Success: Clear lockout counters
      localStorage.removeItem('mnuhub_verify_locked_until')
      toast.success(isAr ? 'تم التحقق وتفعيل الحساب بنجاح!' : 'Account verified successfully!')
      router.push('/#dashboard')
    } catch (error: any) {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS
        setLockedUntil(lockTime)
        localStorage.setItem('mnuhub_verify_locked_until', lockTime.toString())

        toast.error(
          isAr
            ? '🛑 تم حظر الجهاز لمدة 15 دقيقة لتجاوز 5 محاولات إدخال خاطئة.'
            : '🛑 Device locked for 15 minutes due to 5 failed OTP attempts.'
        )
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - newAttempts
        toast.error(
          error.message ||
          (isAr
            ? `رمز التحقق غير صحيح. متبقي لديك ${remaining} محاولات قبل حظر الجهاز.`
            : `Invalid code. ${remaining} attempts remaining before device lockout.`)
        )
      }

      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    if (resendsCount >= MAX_RESENDS_PER_HOUR) {
      toast.error(
        isAr
          ? 'تجاوزت الحد الأقصى لإعادة الإرسال (3 مرات في الساعة). يرجى الانتظار حمايةً من الإسبام.'
          : 'Maximum resends reached (3 per hour). Please wait.'
      )
      return
    }

    const newCooldown = Date.now() + 60 * 1000
    localStorage.setItem('mnuhub_verify_cooldown_until', newCooldown.toString())
    setTimer(60)
    const newResends = resendsCount + 1
    setResendsCount(newResends)
    localStorage.setItem('mnuhub_resends_count', newResends.toString())

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        // Fallback to Supabase resend
        const { error: supaErr } = await supabase.auth.resend({
          type: 'signup',
          email,
        })
        if (supaErr) {
          throw new Error(data.error || supaErr.message)
        }
      }

      toast.success(isAr ? 'تم إعادة إرسال رمز التحقق إلى بريدك!' : 'Verification code resent to your email!')
    } catch (error: any) {
      toast.error(error.message || (isAr ? 'فشل إعادة إرسال الرمز' : 'Failed to resend code'))
      setTimer(0)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-start rtl:text-right">
      <div className="absolute top-4 rtl:left-4 ltr:right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--primary)_0%,transparent_40%)] opacity-10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border/50 bg-secondary/30 glass p-8 shadow-2xl text-center"
      >
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary glow-ring">
          {isLockedOut ? <Lock className="size-8 text-destructive animate-bounce" /> : <Mail className="size-8" />}
        </div>

        <h1 className="font-display text-2xl font-bold">
          {isAr ? 'افحص بريدك الإلكتروني' : 'Check your email'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-balance">
          {isAr ? (
            <>لقد أرسلنا رمز تحقق مكون من 6 أرقام إلى <span className="font-semibold text-foreground inline-block dir-ltr">{email || 'بريدك الجامعي'}</span>.</>
          ) : (
            <>We&apos;ve sent a 6-digit verification code to <span className="font-semibold text-foreground inline-block dir-ltr">{email || 'your university email'}</span>.</>
          )}
        </p>

        {/* Device Lockout Warning Banner */}
        {isLockedOut && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-semibold text-destructive flex items-center gap-3 text-start"
          >
            <ShieldAlert className="size-6 shrink-0" />
            <div>
              <p className="font-bold">{isAr ? 'الجهاز محظور مؤقتاً 🛑' : 'Device Temporarily Locked 🛑'}</p>
              <p className="text-[11px] font-normal opacity-90 mt-0.5">
                {isAr
                  ? `تجاوزت 5 محاولات خاطئة. المحاولات مجهزة للتفاعل مجدداً بعد ${remainingLockMinutes} دقيقة.`
                  : `5 failed OTP attempts. Retry enabled in ${remainingLockMinutes} minutes.`}
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          {/* LTR Container for Left-to-Right 1st->6th digit flow */}
          <div dir="ltr" className="flex flex-row items-center justify-center gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                dir="ltr"
                disabled={isLockedOut}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="size-12 rounded-xl border border-border bg-background text-center font-display text-xl font-bold shadow-inner outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 sm:size-14 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          {failedAttempts > 0 && !isLockedOut && (
            <p className="mt-2 text-xs text-amber-400 font-medium">
              {isAr
                ? `متبقي لديك ${MAX_FAILED_ATTEMPTS - failedAttempts} محاولات قبل حظر الجهاز مؤقتاً.`
                : `${MAX_FAILED_ATTEMPTS - failedAttempts} attempts left before lockout.`}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || isLockedOut || otp.some((d) => d === '')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="size-5" />
                {isAr ? 'تأكيد الحساب' : 'Verify Account'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground space-y-3">
          <div>
            {isAr ? 'لم يصلك البريد؟ ' : 'Didn’t receive the email? '}
            {timer > 0 ? (
              <span className="font-medium text-foreground/70 inline-block dir-ltr">
                {isAr ? `إعادة الإرسال خلال 0:${timer.toString().padStart(2, '0')}` : `Resend in 0:${timer.toString().padStart(2, '0')}`}
              </span>
            ) : resendsCount >= MAX_RESENDS_PER_HOUR ? (
              <span className="text-xs text-destructive font-semibold block mt-1">
                {isAr ? 'تجاوزت الحد الأقصى لإعادة الإرسال (3 مرات).' : 'Max resends reached (3 per hour).'}
              </span>
            ) : (
              <button
                onClick={handleResend}
                type="button"
                className="font-medium text-primary hover:underline"
              >
                {isAr ? `أعد الإرسال الآن (${MAX_RESENDS_PER_HOUR - resendsCount} متبقية)` : `Resend now (${MAX_RESENDS_PER_HOUR - resendsCount} left)`}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <VerifyContent />
    </Suspense>
  )
}
