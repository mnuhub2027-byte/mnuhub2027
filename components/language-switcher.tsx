'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/50"
    >
      <Languages className="size-4 text-muted-foreground" />
      <span className={language === 'ar' ? 'font-sans' : 'font-arabic'}>
        {language === 'ar' ? 'English' : 'العربية'}
      </span>
    </button>
  )
}
