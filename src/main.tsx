import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import PrivacyPolicy from './PrivacyPolicy'
import LoginScreen from './LoginScreen'
import PaywallScreen from './PaywallScreen'
import LandingPage from './LandingPage'
import { supabase, saveSessionCookies, getSessionCookies, clearSessionCookies } from './supabaseClient'
import { isNativeIOS, checkStoreKitEntitlements } from './storekit'
import './index.css'

const isPrivacyPage = window.location.pathname === '/privacy'
const isLandingPage = window.location.pathname === '/landing'

const SPLASH_COLOURS = ['#00843D', '#5EB6E4', '#FF4F00']
const splashColour = SPLASH_COLOURS[Math.floor(Math.random() * SPLASH_COLOURS.length)]

// ── DEV BYPASS: set to false before deploying to Railway ─────────────────────
const BYPASS_AUTH = false

// ── iOS: no login required, StoreKit handles licensing ───────────────────────
function IOSGate() {
  const [isLicensed, setIsLicensed] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    checkStoreKitEntitlements().then(setIsLicensed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        setShowLogin(false)
      } else {
        setUserId(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!BYPASS_AUTH && isLicensed === null) return null

  if (!BYPASS_AUTH && !isLicensed) {
    return <PaywallScreen userId={userId || ''} onLicensed={() => setIsLicensed(true)} />
  }

  if (showLogin) {
    return <LoginScreen onCancel={() => setShowLogin(false)} />
  }

  return <App userId={userId} onSaveToCloud={() => setShowLogin(true)} />
}

function AuthGate() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [userId, setUserId] = useState<string | null>(null)
  const [isLicensed, setIsLicensed] = useState<boolean | null>(null)

  const checkLicense = async (uid: string) => {
    try {
      if (isNativeIOS) {
        const licensed = await checkStoreKitEntitlements()
        setIsLicensed(licensed)
      } else {
        const res = await fetch(`/api/squad-status/${uid}`)
        const data = await res.json()
        setIsLicensed(!!data.is_licensed)
      }
    } catch {
      setIsLicensed(false)
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        saveSessionCookies(session.access_token, session.refresh_token!)
        setUserId(session.user.id)
        setAuthStatus('authenticated')
        checkLicense(session.user.id)
      } else {
        if (event === 'SIGNED_OUT') clearSessionCookies()
        setUserId(null)
        setAuthStatus('unauthenticated')
        setIsLicensed(null)
      }
    })

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setAuthStatus('authenticated')
        checkLicense(session.user.id)
      } else {
        // localStorage is empty (browser was quit) — try restoring from cookies
        const cookies = getSessionCookies()
        if (cookies) {
          const { data } = await supabase.auth.setSession({
            access_token: cookies.accessToken,
            refresh_token: cookies.refreshToken,
          })
          if (!data.session) {
            clearSessionCookies()
            setAuthStatus('unauthenticated')
          }
          // if successful, onAuthStateChange fires and handles the rest
        } else {
          setAuthStatus('unauthenticated')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Dev bypass: skip auth/licensing during testing ────────────────────────
  if (BYPASS_AUTH) return <App userId="dev-user" />

  if (authStatus === 'loading' || (authStatus === 'authenticated' && isLicensed === null)) {
    return <div style={{ position: 'fixed', inset: 0, background: splashColour }} />
  }

  if (authStatus === 'unauthenticated') {
    return <LandingPage />
  }

  if (!isLicensed) {
    return <PaywallScreen userId={userId!} onLicensed={() => setIsLicensed(true)} />
  }

  return <App userId={userId!} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPrivacyPage ? <PrivacyPolicy /> : isLandingPage ? <LandingPage /> : isNativeIOS ? <IOSGate /> : <AuthGate />}
  </React.StrictMode>,
)
