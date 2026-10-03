'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { en, ar, DictionaryKey } from './dictionaries'

type Language = 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: DictionaryKey) => string
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLanguageState(saved)
    }
  }, [])

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    document.documentElement.dir = dir
    localStorage.setItem('language', language)
    
    if (language === 'ar') {
      document.body.classList.add('font-arabic')
      document.body.classList.remove('font-sans')
    } else {
      document.body.classList.add('font-sans')
      document.body.classList.remove('font-arabic')
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: DictionaryKey): string => {
    const dict = language === 'ar' ? ar : en
    return dict[key] || en[key] || key
  }

  const dir = language === 'ar' ? 'rtl' : 'ltr'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
