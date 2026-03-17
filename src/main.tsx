import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import PrivacyPolicy from './PrivacyPolicy'
import LoginScreen from './LoginScreen'
import PaywallScreen from './PaywallScreen'
import { supabase } from './supabaseClient'
import './index.css'

const isPrivacyPage = window.location.pathname === '/privacy'

// ── DEV BYPASS: set to false before deploying to Railway ─────────────────────
const BYPASS_AUTH = true

function AuthGate() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [userId, setUserId] = useState<string | null>(null)
  const [isLicensed, setIsLicensed] = useState<boolean | null>(null)

  const checkLicense = async (uid: string) => {
    try {
      const res = await fetch(`/api/squad-status/${uid}`)
      const data = await res.json()
      setIsLicensed(!!data.is_licensed)
    } catch {
      setIsLicensed(false)
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        setAuthStatus('authenticated')
        checkLicense(session.user.id)
      } else {
        setUserId(null)
        setAuthStatus('unauthenticated')
        setIsLicensed(null)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setAuthStatus('authenticated')
        checkLicense(session.user.id)
      } else {
        setAuthStatus('unauthenticated')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Dev bypass: skip auth/licensing during testing ────────────────────────
  if (BYPASS_AUTH) return <App userId="dev-user" />

  if (authStatus === 'loading' || (authStatus === 'authenticated' && isLicensed === null)) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#7A263A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(52px, 14vw, 80px)',
        color: '#F3D459',
      }}>
        LAZY GAFFER
      </div>
    )
  }

  if (authStatus === 'unauthenticated') {
    return <LoginScreen />
  }

  if (!isLicensed) {
    return <PaywallScreen userId={userId!} onLicensed={() => setIsLicensed(true)} />
  }

  return <App userId={userId!} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPrivacyPage ? <PrivacyPolicy /> : <AuthGate />}
  </React.StrictMode>,
)
