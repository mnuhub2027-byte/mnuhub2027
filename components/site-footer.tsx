'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Building2, Sparkles, Send, Heart, Mail, CheckCircle2, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { faculties } from '@/lib/data'

export function SiteFooter() {
  const { t, language } = useLanguage()
  const isAr = language === 'ar'
  const currentFaculties = faculties[language] || faculties.ar
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setSubscribed(true)
    toast.success(isAr ? 'تم الاشتراك بنجاح في النشرة الإخبارية لفعاليات الجامعة 🎉' : 'Subscribed to campus events newsletter successfully!')
    setNewsletterEmail('')
  }

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-border/80 bg-card/60 backdrop-blur-2xl text-start rtl:text-right">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 size-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 size-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Campus Newsletter Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-secondary/30 p-6 sm:p-8 shadow-xl mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="size-3.5" />
                {isAr ? 'النشرة الإخبارية لفعاليات الجامعة' : 'Campus Events Digest'}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold">
                {isAr ? 'احصل على آخر الفعاليات والأنشطة الطلابية' : 'Stay Updated with Campus Activities'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? 'اشترك ليصلك تنبيه مخصص بأهم الأنشطة والمسابقات الطلابية بكليتك.'
                  : 'Subscribe to receive curated alerts about student activities and competitions.'}
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full lg:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-5 py-3 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span>{isAr ? 'تم الاشتراك بنجاح!' : 'Subscribed!'}</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Mail className="absolute rtl:right-3 ltr:left-3 top-3 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value.replace(/[^\x20-\x7E]/g, '').trim())}
                      onPaste={(e) => {
                        e.preventDefault()
                        const pasted = e.clipboardData.getData('text').replace(/[^\x20-\x7E]/g, '').trim()
                        setNewsletterEmail(pasted)
                      }}
                      placeholder={isAr ? 'أدخل البريد الجامعي الرسمي' : 'Enter official university email'}
                      className="w-full rounded-2xl border border-border bg-background/80 rtl:pr-10 ltr:pl-10 px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-primary transition-all font-sans"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors shrink-0"
                  >
                    <span>{isAr ? 'اشترك الآن' : 'Subscribe'}</span>
                    <Send className="size-3.5 rtl:rotate-180" />
                  </motion.button>
                </div>
              )}
            </form>
          </div>
        </motion.div>

        {/* 4-Column Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-border/50">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white p-1 shadow-md">
                <img
                  src="/mnu-logo.png"
                  alt="Mansoura National University Logo"
                  className="size-full object-contain"
                />
              </div>
              <div>
                <span className="font-display text-xl font-bold tracking-tight block">
                  MNU<span className="text-primary">Hub</span>
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {isAr ? 'جامعة المنصورة الأهلية' : 'Mansoura National University'}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? 'المنصة المركزية للأنشطة الطلابية والأندية بجامعة المنصورة الأهلية.'
                : 'The central hub for student clubs and activities across Mansoura National University.'}
            </p>
          </div>

          {/* Col 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-foreground">{isAr ? 'روابط سريعة' : 'Quick Links'}</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a href="/#directory" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>←</span> {isAr ? 'دليل الأندية والفرق' : 'Club Directory'}
                </a>
              </li>
              <li>
                <a href="/#events" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>←</span> {isAr ? 'جدول الفعاليات والورش' : 'Campus Events Feed'}
                </a>
              </li>
              <li>
                <a href="/#dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>←</span> {isAr ? 'لوحة التحكم الطلابية' : 'Student Dashboard'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Faculties */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-foreground">{isAr ? 'كليات الجامعة' : 'Faculties'}</h4>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              {currentFaculties.slice(0, 5).map((fac) => (
                <li key={fac} className="truncate hover:text-foreground transition-colors flex items-center gap-1">
                  <Building2 className="size-3 text-primary shrink-0" />
                  <span>{fac}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Support & Contact */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-foreground">{isAr ? 'الدعم والاستفسارات' : 'Help & Support'}</h4>
            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <HelpCircle className="size-4 text-primary" />
                <span>{isAr ? 'الدعم الفني والجامعي' : 'University Helpdesk'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isAr ? 'لأي استفسار يتعلق بالأنشطة الطلابية أو الحساب الجامعي، يسعدنا تواصلك مع إدارة المنصة.' : 'For help with student accounts or activities, contact support.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{t('footer.rights')}</p>
          <p className="flex items-center gap-1 font-medium">
            {isAr ? 'صُنع بـ' : 'Built with'}
            <Heart className="size-3.5 fill-red-500 text-red-500 animate-pulse" />
            {isAr ? 'لطلاب جامعة المنصورة الأهلية' : 'for Mansoura National University Students'}
          </p>
        </div>
      </div>
    </footer>
  )
}
