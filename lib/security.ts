/**
 * MNUHub Cybersecurity & Input Sanitization Module
 * Implements strict validation, XSS prevention, password strength scoring,
 * and URL sanitization across the entire platform.
 */

// ── 1. Password Strength Checker ──────────────────────────────
export type PasswordStrength = {
  score: number // 0 to 4
  label: { ar: string; en: string }
  color: string
  hasMinLength: boolean
  hasUpper: boolean
  hasLower: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  let score = 0
  if (hasMinLength) score++
  if (hasUpper && hasLower) score++
  if (hasNumber) score++
  if (hasSpecial) score++

  const labels = [
    { ar: 'ضعيفة جداً', en: 'Very Weak' },
    { ar: 'ضعيفة', en: 'Weak' },
    { ar: 'متوسطة', en: 'Medium' },
    { ar: 'قوية', en: 'Strong' },
    { ar: 'قوية جداً 🛡️', en: 'Very Strong 🛡️' },
  ]

  const colors = [
    'bg-destructive/80 text-destructive',
    'bg-red-500 text-red-500',
    'bg-amber-500 text-amber-500',
    'bg-emerald-500 text-emerald-500',
    'bg-primary text-primary',
  ]

  return {
    score,
    label: labels[score],
    color: colors[score],
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  }
}

// ── 2. Email Validation ───────────────────────────────────────
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  // Strict RFC 5322 compatible email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(trimmed)
}

// ── 3. Safe URL Sanitizer (Prevents XSS via javascript: URIs) ─
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#'
  const trimmed = url.trim()
  
  // Block dangerous protocols
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '#'
  }

  // Prepend https:// if no protocol supplied
  if (!lower.startsWith('http://') && !lower.startsWith('https://') && !lower.startsWith('/')) {
    return `https://${trimmed}`
  }

  return trimmed
}

// ── 4. XSS & HTML Input Sanitization ──────────────────────────
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

// ── 5. Student ID & Phone Validation ──────────────────────────
export function isValidStudentId(id: string): boolean {
  const trimmed = id.trim()
  // Student ID should be 6-12 numeric digits
  return /^[0-9]{6,12}$/.test(trimmed)
}

export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim()
  // Phone/WhatsApp should contain 10-15 digits with optional leading +
  return /^\+?[0-9]{10,15}$/.test(trimmed)
}

// ── 6. Client Rate Limiter / Cooldown Store ───────────────────
const cooldownMap = new Map<string, number>()

export function checkRateLimit(key: string, cooldownMs = 3000): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now()
  const lastTime = cooldownMap.get(key) || 0
  const diff = now - lastTime

  if (diff < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - diff) / 1000)
    return { allowed: false, remainingSeconds }
  }

  cooldownMap.set(key, now)
  return { allowed: true, remainingSeconds: 0 }
}
