'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, ArrowRight, Mail, Lock, User, Building, Loader2, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRole, type Role } from '@/components/role-context'

// Valid invite codes map for role assignment override
const INVITE_CODES: Record<string, Role> = {
  OWNER2026: 'owner',
  LEADER2026: 'leader',
  VICE2026: 'assistant',
  MEMBER2026: 'member',
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [faculty, setFaculty] = useState('')
  const [studentId, setStudentId] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  
  const router = useRouter()
  const supabase = createClient()
  const { setRole } = useRole()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Clean up any old active session first
    await supabase.auth.signOut()

    // Strict role evaluation: Default to 'applicant' (Regular Student) unless valid Invite Code is provided
    let assignedRole: Role = 'applicant'
    const cleanedCode = inviteCode.trim().toUpperCase()

    if (cleanedCode) {
      if (INVITE_CODES[cleanedCode]) {
        assignedRole = INVITE_CODES[cleanedCode]
      } else {
        toast.error('Invalid Role Invite Code. Defaulting to Regular Student role.')
      }
    }

    try {
      if (!isLogin) {
        // Sign up with Supabase
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              faculty,
              student_id: studentId,
              role: assignedRole,
            }
          }
        })
        
        if (error) {
          if (error.message.includes('fetch') || error.message.includes('Failed')) {
            // Fallback for demo when Supabase backend is unreachable/offline
            setRole(assignedRole)
            toast.success(`Account created (Demo Mode)! Assigned role: ${assignedRole.toUpperCase()}.`)
            router.push(`/verify?email=${encodeURIComponent(email)}`)
            return
          }
          throw error
        }

        setRole(assignedRole)
        toast.success('Account created! Please check your email for the verification code.')
        router.push(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        // Log in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          if (error.message.includes('fetch') || error.message.includes('Failed')) {
            // Fallback for demo when Supabase backend is unreachable
            setRole('applicant')
            toast.success('Signed in (Demo Mode)!')
            router.push('/#dashboard')
            return
          }
          throw error
        }
        
        // Role detection upon login
        const userRole = (data.user?.user_metadata?.role as Role) || 'applicant'
        setRole(userRole)
        
        toast.success(`Welcome back to MNUHub! Logged in as ${userRole.toUpperCase()}.`)
        router.push('/#dashboard')
      }
    } catch (error: any) {
      // Fallback demo redirect if Supabase connection fails
      if (error.message?.includes('fetch') || error.toString().includes('fetch')) {
        setRole(assignedRole)
        toast.success(`Demo registration completed! Role: ${assignedRole.toUpperCase()}.`)
        router.push(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(error.message || 'An error occurred during authentication')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground">
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
            Your university life, <br />
            <span className="text-muted-foreground">all in one place.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Join thousands of students managing their clubs, events, and recruitment seamlessly.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 border-l border-border/50 bg-background/50 glass">
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
            {isLogin ? 'Welcome back' : 'Create student account'}
          </h2>
          {isLogin && (
            <p className="mt-2 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          )}

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <input required value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="John Doe" className="w-full rounded-xl border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">Faculty</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <select required value={faculty} onChange={(e) => setFaculty(e.target.value)} className="w-full appearance-none rounded-xl border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground">
                          <option value="" disabled>Select your faculty</option>
                          <option value="engineering">Engineering</option>
                          <option value="science">Sciences</option>
                          <option value="business">Business School</option>
                          <option value="arts">Arts & Humanities</option>
                          <option value="medicine">Medicine</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">Student ID</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <input required value={studentId} onChange={(e) => setStudentId(e.target.value)} type="text" placeholder="20240101" className="w-full rounded-xl border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">University Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@std.mnu.edu.eg" className="w-full rounded-xl border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full rounded-xl border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                {isLogin && (
                  <div className="mt-1 flex justify-end">
                    <a href="#" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign in' : 'Create account'}
                    <ArrowRight className="size-4" />
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

