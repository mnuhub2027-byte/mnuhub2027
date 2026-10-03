'use client'

import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationCenter } from '@/components/notification-center'
import { roleMeta, useRole } from '@/components/role-context'
import type { DictionaryKey } from '@/lib/i18n/dictionaries'

type LinkDef = { labelKey: DictionaryKey; href: string }
const links: LinkDef[] = [
  { labelKey: 'nav.exploreClubs', href: '#directory' },
  { labelKey: 'nav.dashboard', href: '#dashboard' },
  { labelKey: 'nav.events', href: '#events' },
  { labelKey: 'nav.about', href: '#hero' },
]
const roleBadgeStyles: Record<string, string> = {
  applicant: 'text-sky-400 bg-sky-500/20 border border-sky-500/40 shadow-xs',
  member: 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 shadow-xs',
  assistant: 'text-blue-400 bg-blue-500/20 border border-blue-500/40 shadow-xs',
  leader: 'text-amber-400 bg-amber-500/20 border border-amber-500/40 shadow-xs',
  owner: 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/40 shadow-xs',
}

function getUserAvatar(fullName?: string) {
  if (!fullName) return <User className="size-4" />
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}.${parts[1].charAt(0)}`
  }
  return parts[0].charAt(0).toUpperCase()
}

export function SiteHeader() {
  const { role } = useRole()
  const { t, language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()
  const router = useRouter()

  const [activeSection, setActiveSection] = useState<string>('#directory')

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Scroll detection & Section Spy
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })

    const sections = ['directory', 'events', 'dashboard', 'hero']
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 120
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(`#${sectionId}`)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScrollSpy, { passive: true })
    handleScrollSpy()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', handleScrollSpy)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [dropdownOpen])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setActiveSection(href)
    setOpen(false)
    const targetId = href.replace('#', '')
    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      router.push(`/${href}`)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const currentMeta = roleMeta[role]
  const RoleIcon = currentMeta.icon
  const roleLabel = language === 'ar' ? currentMeta.arabic : currentMeta.label

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-border/80 header-scrolled'
          : 'border-border/40 glass'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
            <img
              src="/mnu-logo.png"
              alt="MNU Logo"
              className="size-full object-contain"
            />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            MNU<span className="text-primary">Hub</span>
          </span>
        </motion.a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex rounded-full border border-border/50 bg-secondary/30 p-1">
          {links.map((link, i) => {
            const isActive = activeSection === link.href || (link.href === '#hero' && activeSection === '#hero')
            return (
              <motion.a
                key={link.labelKey}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-full bg-background border border-border shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t(link.labelKey)}</span>
              </motion.a>
            )
          })}
        </nav>

        {/* Desktop Right */}
        <div className="hidden items-center gap-2.5 md:flex">
          {session && <NotificationCenter />}
          <LanguageSwitcher />
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-border bg-background p-1 pr-3 rtl:pl-3 rtl:pr-1 text-sm font-medium transition-colors hover:bg-secondary shadow-xs"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs shadow-inner">
                  {getUserAvatar(session.user.user_metadata?.full_name)}
                </span>
                <span className="max-w-[110px] truncate text-xs font-semibold text-foreground">{session.user.user_metadata?.full_name || 'Student'}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${roleBadgeStyles[role] || 'text-primary bg-primary/15 border border-primary/30'}`}>
                  <RoleIcon className="size-3" />
                  {roleLabel}
                </span>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="absolute rtl:left-0 ltr:right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="px-3 py-2 border-b border-border/60 mb-1">
                      <p className="text-xs text-muted-foreground">{t('nav.verifiedRole')}</p>
                      <p className={`text-xs font-bold ${roleBadgeStyles[role] || 'text-primary'} inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg mt-1`}>
                        <RoleIcon className="size-3.5" />
                        {roleLabel}
                      </p>
                    </div>
                    <a href="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                      <User className="size-4" />
                      {t('nav.myProfile')}
                    </a>
                    <a href="/#dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                      <LayoutDashboard className="size-4" />
                      {t('nav.dashboard')}
                    </a>
                    <div className="my-1 h-px bg-border/60" />
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut className="size-4" />
                      {t('nav.signOut')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <motion.a
                href="/auth"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {t('nav.signIn')}
              </motion.a>
              <motion.a
                href="/auth"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm"
                whileHover={{ scale: 1.04, boxShadow: '0 0 20px oklch(0.62 0.24 300 / 40%)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {t('nav.getStarted')}
              </motion.a>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          {session && <NotificationCenter />}
          <LanguageSwitcher />
          <motion.button
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="x" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="size-5" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="size-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((link, i) => (
                <motion.a
                  key={link.labelKey}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {t(link.labelKey)}
                </motion.a>
              ))}
              <motion.a
                href="/auth"
                onClick={() => setOpen(false)}
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: links.length * 0.05, duration: 0.2 }}
                className="mt-1 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                {t('nav.getStarted')}
              </motion.a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
