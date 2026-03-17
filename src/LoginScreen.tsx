import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState<'form' | 'sent'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: window.location.origin }
    })
    setLoading(false)
    if (error) setError(error.message)
    else setStage('sent')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--color-t-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Courier New", Courier, monospace',
    }}>
      <div style={{ width: '100%', maxWidth: 480, padding: '0 24px' }}>

        <div style={{
          fontFamily: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(52px, 14vw, 80px)',
          color: 'var(--color-t-c4)',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          LAZY GAFFER
        </div>

        <div style={{
          borderBottom: '4px solid var(--color-t-c2)',
          marginBottom: 32,
        }} />

        {stage === 'form' ? (
          <>
            <div style={{
              color: 'var(--color-t-c1)',
              fontSize: 14,
              letterSpacing: 1,
              marginBottom: 16,
              textTransform: 'uppercase',
            }}>
              Enter your email to sign in
            </div>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="YOUR EMAIL ADDRESS"
              autoCapitalize="off"
              autoCorrect="off"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--color-t-bg)',
                border: '2px solid var(--color-t-c1)',
                color: 'var(--color-t-c1)',
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: 16,
                padding: '10px 12px',
                outline: 'none',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            />

            {error && (
              <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                background: 'none',
                border: '2px solid var(--color-t-c2)',
                color: 'var(--color-t-c2)',
                fontFamily: '"Rajdhani", sans-serif',
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 3,
                padding: '10px 0',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'SENDING...' : 'SEND MAGIC LINK'}
            </button>
          </>
        ) : (
          <>
            <div style={{
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 700,
              fontSize: 28,
              color: 'var(--color-t-c2)',
              letterSpacing: 2,
              marginBottom: 16,
            }}>
              CHECK YOUR EMAIL
            </div>
            <div style={{ color: 'var(--color-t-c1)', fontSize: 15, lineHeight: 1.7 }}>
              We've sent a sign-in link to <span style={{ color: 'var(--color-t-c4)' }}>{email}</span>.
              <br /><br />
              Tap the link in the email to open the app.
            </div>
            <button
              onClick={() => setStage('form')}
              style={{
                marginTop: 24,
                background: 'none',
                border: 'none',
                color: 'var(--color-t-c1)',
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: 13,
                cursor: 'pointer',
                opacity: 0.6,
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Wrong email? Go back
            </button>
          </>
        )}
      </div>
    </div>
  )
}
