'use client'

import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const links = [
  { label: 'Explore Clubs', href: '#directory' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Events', href: '#events' },
  { label: 'About', href: '#hero' },
]

import { roleMeta, useRole } from '@/components/role-context'

export function SiteHeader() {
  const { role } = useRole()
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const currentMeta = roleMeta[role]
  const RoleIcon = currentMeta.icon

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-white p-1">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nQ6F364fJ1e3KibLALQvE8Z009eIqR.png" 
              alt="MNU Logo" 
              className="size-full object-contain"
            />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            MNU<span className="text-primary">Hub</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-border bg-background p-1 pr-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                  {session.user.user_metadata?.full_name?.charAt(0).toUpperCase() || <User className="size-4" />}
                </span>
                <span className="max-w-[100px] truncate">{session.user.user_metadata?.full_name || 'Student'}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${currentMeta.accent} bg-secondary/80 border border-border/50`}>
                  <RoleIcon className="size-3" />
                  {currentMeta.label}
                </span>
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-background/95 p-1.5 shadow-xl backdrop-blur-lg"
                  >
                    <div className="px-3 py-2 border-b border-border/60 mb-1">
                      <p className="text-xs text-muted-foreground">Verified Role</p>
                      <p className={`text-xs font-bold ${currentMeta.accent} flex items-center gap-1 mt-0.5`}>
                        <RoleIcon className="size-3.5" />
                        {currentMeta.label} ({currentMeta.arabic})
                      </p>
                    </div>

                    <a href="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary">
                      <User className="size-4" />
                      My Profile
                    </a>
                    <a href="/#dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </a>
                    <div className="my-1 h-px bg-border/60" />
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10">
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <a
                href="/auth"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Sign in
              </a>
              <a
                href="/auth"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Get started
              </a>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/auth"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Get started
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
