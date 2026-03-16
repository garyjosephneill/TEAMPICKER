import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import PrivacyPolicy from './PrivacyPolicy'
import LoginScreen from './LoginScreen'
import { supabase } from './supabaseClient'
import './index.css'

const isPrivacyPage = window.location.pathname === '/privacy'

function AuthGate() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        setAuthStatus('authenticated')
      } else {
        setUserId(null)
        setAuthStatus('unauthenticated')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setAuthStatus('authenticated')
      } else {
        setAuthStatus('unauthenticated')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (authStatus === 'loading') {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#7A263A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
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

  return <App userId={userId!} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPrivacyPage ? <PrivacyPolicy /> : <AuthGate />}
  </React.StrictMode>,
)
