import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gkmwcaswpamdbnkhpvjt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbXdjYXN3cGFtZGJua2hwdmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzI5MDMsImV4cCI6MjA4OTI0ODkwM30.M0qotPFbHr4zAmesypz5dLp54scq1NEzp6BMVHBkYIA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  }
})
