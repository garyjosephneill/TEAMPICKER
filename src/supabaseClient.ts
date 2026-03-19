import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gkmwcaswpamdbnkhpvjt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbXdjYXN3cGFtZGJua2hwdmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzI5MDMsImV4cCI6MjA4OTI0ODkwM30.M0qotPFbHr4zAmesypz5dLp54scq1NEzp6BMVHBkYIA'

// Cookie-based storage so sessions survive browser quits (like native apps)
const cookieStorage = {
  getItem: (key: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  },
  setItem: (key: string, value: string): void => {
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`
  },
  removeItem: (key: string): void => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  },
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storage: cookieStorage,
  }
})
