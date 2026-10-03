import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, Cairo, Almarai } from 'next/font/google'
import './globals.css'
import { RoleProvider } from '@/components/role-context'
import { SystemProvider } from '@/lib/system-context'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: true })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap', preload: true })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo', display: 'swap', preload: true })
const almarai = Almarai({ weight: ['400', '700'], subsets: ['arabic'], variable: '--font-almarai', display: 'swap', preload: true })

export const metadata: Metadata = {
  title: 'MNUHub — Discover & Join Mansoura National University Clubs',
  description:
    'The official central hub for Mansoura National University clubs, events, and recruitment. Explore clubs, apply, and manage your journey from student to leader.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#141420',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning prevents React from warning when LanguageContext
    // updates lang/dir client-side after SSR hydration.
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`dark bg-background ${inter.variable} ${spaceGrotesk.variable} ${cairo.variable} ${almarai.variable}`}
    >
      <body className="font-sans antialiased">
        <Toaster theme="dark" position="bottom-right" className="font-sans" />
        <LanguageProvider>
          <SystemProvider>
            <RoleProvider>
              {children}
            </RoleProvider>
          </SystemProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
