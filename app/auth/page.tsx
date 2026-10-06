'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, ArrowRight, Mail, Lock, User, Building, Loader2, ShieldAlert, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRole, type Role } from '@/components/role-context'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/language-switcher'
import { faculties } from '@/lib/data'
import {
  checkPasswordStrength,
  isValidEmail,
  isValidStudentId,
  sanitizeText,
  checkRateLimit,
} from '@/lib/security'

// Valid invite codes map for role assignment override
const INVITE_CODES: Record<string, Role> = {
  OWNER2026: 'owner',
  LEADER2026: 'leader',
  VICE2026: 'assistant',
  MEMBER2026: 'member',
}

export default function AuthPage() {
  const { t, language } = useLanguage()
  const isAr = language === 'ar'
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [faculty, setFaculty] = useState('')
  const [studentId, setStudentId] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [websiteHp, setWebsiteHp] = useState('') // Honeypot bot trap
  const [resetLoading, setResetLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { setRole } = useRole()

  const currentFaculties = faculties[language] || faculties.ar
  const passStrength = checkPasswordStrength(password)

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!email || !isValidEmail(email)) {
      toast.error(
        isAr
          ? 'يرجى إدخال بريد إلكتروني صالح في خانة البريد الإلكتروني أولاً.'
          : 'Please enter a valid email address in the email field first.'
      )
      document.getElementById('auth-email-input')?.focus()
      return
    }

    setResetLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      })
      if (error) throw error

      toast.success(
        isAr
          ? 'تم إرسال رابط إعادة ضبط كلمة المرور إلى بريدك الإلكتروني بنجاح! 📧'
          : 'Password reset link sent successfully to your email! 📧'
      )
    } catch (error: any) {
      toast.error(
        error.message || (isAr ? 'حدث خطأ أثناء إرسال رابط الضبط' : 'Failed to send reset link')
      )
    } finally {
      setResetLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ── Security Check 0: Anti-Bot Honeypot Trap ────────────────
    if (websiteHp) {
      // Automated bot detected: return silently without processing
      return
    }

    // ── Security Check 1: Rate Limiting ────────────────────────
    const rateCheck = checkRateLimit('auth_submit', 2000)
    if (!rateCheck.allowed) {
      toast.error(
        isAr
          ? `يرجى التريث ${rateCheck.remainingSeconds} ثوانٍ قبل المحاولة مرة أخرى.`
          : `Please wait ${rateCheck.remainingSeconds}s before trying again.`
      )
      return
    }

    // ── Security Check 2: Email Format ─────────────────────────
    if (!isValidEmail(email)) {
      toast.error(
        isAr
          ? 'صيغة البريد الإلكتروني غير صحيحة. يرجى إدخال بريد إلكتروني صالح.'
          : 'Invalid email format. Please enter a valid email address.'
      )
      return
    }

    // ── Security Check 3: Signup Specific Validation ───────────
    if (!isLogin) {
      const cleanName = sanitizeText(fullName)
      if (!cleanName || cleanName.length < 3) {
        toast.error(
          isAr
            ? 'يرجى إدخال الاسم الرباعي بشكل صحيح (3 حروف على الأقل).'
            : 'Please enter a valid full name (minimum 3 characters).'
        )
        return
      }

      if (!studentId || !isValidStudentId(studentId)) {
        toast.error(
          isAr
            ? 'الرقم الجامعي غير صحيح. يجب أن يتكون من 6 إلى 12 رقماً.'
            : 'Invalid Student ID. Must contain between 6 and 12 digits.'
        )
        return
      }

      if (!faculty) {
        toast.error(isAr ? 'يرجى اختيار الكلية.' : 'Please select your faculty.')
        return
      }

      if (passStrength.score < 2) {
        toast.error(
          isAr
            ? 'كلمة المرور ضعيفة جداً. يجب أن تحتوي على 8 أحرف على الأقل ومزيج من الحروف والأرقام.'
            : 'Password too weak. Must be at least 8 characters with a mix of letters and numbers.'
        )
        return
      }
    }

    setIsLoading(true)
    await supabase.auth.signOut()

    let assignedRole: Role = 'applicant'
    const cleanedCode = inviteCode.trim().toUpperCase()

    if (cleanedCode) {
      if (INVITE_CODES[cleanedCode]) {
        assignedRole = INVITE_CODES[cleanedCode]
      } else {
        toast.error(
          isAr
            ? 'كود الدعوة غير صحيح. سيتم تسجيل الحساب كطالب عادي.'
            : 'Invalid Role Invite Code. Defaulting to Regular Student role.'
        )
      }
    }

    try {
      if (!isLogin) {
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: sanitizeText(fullName),
              faculty,
              student_id: studentId.trim(),
              role: assignedRole,
            },
          },
        }).catch((e) => console.warn('Supabase auth signup warning:', e))

        // Dispatch Resend OTP email in under 1 second using RESEND_API_KEY
        const otpRes = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            fullName: sanitizeText(fullName),
          }),
        }).catch((e) => {
          console.error('Resend OTP trigger error:', e)
          return null
        })

        if (otpRes && otpRes.ok) {
          toast.success(
            isAr
              ? 'تم إنشاء الحساب وإرسال كود التحقق إلى بريدك الإلكتروني! 📧'
              : 'Account created! Verification code sent to your email! 📧'
          )
        } else {
          const errBody = otpRes ? await otpRes.json().catch(() => null) : null
          const errMsg = errBody?.error || (isAr ? 'فشل إرسال كود التحقق إلى البريد' : 'Failed to send OTP code to email')
          toast.error(errMsg)
        }

        setRole(assignedRole)
        router.push(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) {
          if (error.message.includes('fetch') || error.message.includes('Failed')) {
            setRole('applicant')
            toast.success(isAr ? 'تم تسجيل الدخول (وضع العرض التجريبي)!' : 'Signed in (Demo Mode)!')
            router.push('/#dashboard')
            return
          }
          throw error
        }

        const userRole = (data.user?.user_metadata?.role as Role) || 'applicant'
        setRole(userRole)

        toast.success(
          isAr
            ? `مرحباً بعودتك إلى MNUHub! تم تسجيل الدخول كـ ${userRole.toUpperCase()}.`
            : `Welcome back to MNUHub! Logged in as ${userRole.toUpperCase()}.`
        )
        router.push('/#dashboard')
      }
    } catch (error: any) {
      if (error.message?.includes('fetch') || error.toString().includes('fetch')) {
        setRole(assignedRole)
        toast.success(
          isAr
            ? `تم التسجيل التجريبي بنجاح! الدور: ${assignedRole.toUpperCase()}.`
            : `Demo registration completed! Role: ${assignedRole.toUpperCase()}.`
        )
        router.push(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(error.message || (isAr ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during authentication'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground text-start rtl:text-right">
      {/* Absolute top language switch */}
      <div className="absolute top-4 rtl:left-4 ltr:right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left side branding */}
      <div className="relative hidden w-0 flex-1 flex-col justify-center lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-secondary/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] opacity-20 blur-3xl"></div>
        </div>
        <div className="relative z-10 px-12 xl:px-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="flex size-12 items-center justify-center rounded-full bg-background glow-ring">
              <img src="/mnu-logo.png" alt="MNUHub" className="size-10 object-contain" />
            </span>
            <span className="font-display text-3xl font-bold tracking-tight">
              MNU<span className="text-gradient">Hub</span>
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
            {t('auth.heroTitle1')} <br />
            <span className="text-muted-foreground">{t('auth.heroTitle2')}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            {t('auth.heroSubtitle')}
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 border-l rtl:border-r rtl:border-l-0 border-border/50 bg-background/50 glass">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 lg:hidden flex items-center justify-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-background glow-ring">
              <img src="/mnu-logo.png" alt="MNUHub" className="size-8 object-contain" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">
              MNU<span className="text-gradient">Hub</span>
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold">
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin ? (
              <>
                {t('auth.noAccount')}{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-primary hover:underline"
                >
                  {t('auth.signUp')}
                </button>
              </>
            ) : (
              <>
                {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-primary hover:underline"
                >
                  {t('nav.signIn')}
                </button>
              </>
            )}
          </p>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-Bot Honeypot Hidden Trap */}
              <div className="hidden opacity-0 pointer-events-none absolute -top-[9999px] left-0 size-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                <input
                  type="text"
                  name="b_website_hp_field"
                  value={websiteHp}
                  onChange={(e) => setWebsiteHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">
                        {t('auth.fullName')}
                      </label>
                      <div className="relative">
                        <User className="absolute rtl:right-3 ltr:left-3 top-3 size-4 text-muted-foreground" />
                        <input
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          type="text"
                          placeholder={isAr ? 'أحمد محمد علي' : 'John Doe'}
                          className="w-full rounded-xl border border-border bg-background/50 py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">
                        {t('auth.faculty')}
                      </label>
                      <div className="relative">
                        <Building className="absolute rtl:right-3 ltr:left-3 top-3 size-4 text-muted-foreground" />
                        <select
                          required
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-border bg-background/50 py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                        >
                          <option value="" disabled>
                            {t('auth.selectFaculty')}
                          </option>
                          {currentFaculties.map((fac) => (
                            <option key={fac} value={fac}>
                              {fac}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">
                        {t('auth.studentId')}
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute rtl:right-3 ltr:left-3 top-3 size-4 text-muted-foreground" />
                        <input
                          required
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          type="text"
                          placeholder="20240101"
                          className="w-full rounded-xl border border-border bg-background/50 py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute rtl:right-3 ltr:left-3 top-3 size-4 text-muted-foreground" />
                  <input
                    id="auth-email-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    type="email"
                    placeholder="name@std.mnu.edu.eg"
                    className="w-full rounded-xl border border-border bg-background/50 py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute rtl:right-3 ltr:left-3 top-3 size-4 text-muted-foreground" />
                  <input
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background/50 py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                  />
                </div>

                {/* Password strength meter on sign up */}
                {!isLogin && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {isAr ? 'قوة كلمة المرور:' : 'Password strength:'}
                      </span>
                      <span className="font-semibold text-foreground">
                        {passStrength.label[isAr ? 'ar' : 'en']}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 transition-all duration-300 ${
                            i < passStrength.score ? passStrength.color : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {resetLoading && <Loader2 className="size-3 animate-spin" />}
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? t('nav.signIn') : t('auth.submitCreate')}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
