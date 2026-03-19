import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gkmwcaswpamdbnkhpvjt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbXdjYXN3cGFtZGJua2hwdmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzI5MDMsImV4cCI6MjA4OTI0ODkwM30.M0qotPFbHr4zAmesypz5dLp54scq1NEzp6BMVHBkYIA'

function setCookie(name: string, value: string) {
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; domain=.lazygaffer.com; SameSite=Lax; Secure`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

// Save tokens to small persistent cookies (survive browser quit)
export function saveSessionCookies(accessToken: string, refreshToken: string) {
  setCookie('lg_at', accessToken)
  setCookie('lg_rt', refreshToken)
}

// Read tokens back from cookies
export function getSessionCookies(): { accessToken: string; refreshToken: string } | null {
  const at = getCookie('lg_at')
  const rt = getCookie('lg_rt')
  return at && rt ? { accessToken: at, refreshToken: rt } : null
}

// Clear cookies on sign out
export function clearSessionCookies() {
  deleteCookie('lg_at')
  deleteCookie('lg_rt')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  }
})
