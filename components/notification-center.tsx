'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, FileText, Award, Calendar, ListTodo, Sparkles } from 'lucide-react'
import { useSystem, type SystemNotification } from '@/lib/system-context'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const iconMap: Record<SystemNotification['type'], any> = {
  application: FileText,
  approval: Award,
  event: Calendar,
  task: ListTodo,
  system: Sparkles,
}

const colorMap: Record<SystemNotification['type'], string> = {
  application: 'text-primary bg-primary/10 border-primary/20',
  approval: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  event: 'text-accent bg-accent/10 border-accent/20',
  task: 'text-chart-4 bg-chart-4/10 border-chart-4/20',
  system: 'text-gold bg-gold/10 border-gold/20',
}

export function NotificationCenter() {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Outside click handler
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-secondary/40 text-foreground hover:bg-secondary transition-colors"
        aria-label={isAr ? 'الإشعارات' : 'Notifications'}
      >
        <Bell className="size-4" />
        {unreadNotificationsCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-display text-[10px] font-bold text-primary-foreground shadow-sm"
          >
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute rtl:left-0 ltr:right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl z-50 text-start rtl:text-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display text-sm font-bold">{isAr ? 'مركز الإشعارات' : 'Notifications'}</h4>
                {unreadNotificationsCount > 0 && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {unreadNotificationsCount} {isAr ? 'جديد' : 'new'}
                  </span>
                )}
              </div>
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  <CheckCheck className="size-3.5" />
                  {isAr ? 'تحديد الكل كقروء' : 'Mark all read'}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin space-y-1.5 pr-0.5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  <Bell className="mx-auto size-6 opacity-30 mb-1" />
                  {isAr ? 'لا توجد إشعارات حالياً' : 'No notifications yet'}
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type] || Sparkles
                  const badgeColor = colorMap[n.type] || 'text-primary bg-primary/10'

                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`group relative flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer border ${
                        n.read
                          ? 'border-transparent bg-transparent hover:bg-secondary/40'
                          : 'border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.08]'
                      }`}
                    >
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl border ${badgeColor}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${n.read ? 'text-foreground/80' : 'text-foreground'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-sans">{n.timestamp}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {n.body}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
