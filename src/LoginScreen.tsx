import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function LoginScreen({ onCancel }: { onCancel?: () => void } = {}) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { shouldCreateUser: true }
    })
    setLoading(false)
    if (error) setError(error.message)
    else setStage('code')
  }

  const handleVerifyCode = async () => {
    const trimmed = code.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: trimmed,
      type: 'email'
    })
    setLoading(false)
    if (error) setError('Invalid code. Please try again.')
  }

  const containerStyle: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'var(--color-t-bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Rajdhani", sans-serif',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--color-t-bg)',
    border: '2px solid var(--color-t-c1)',
    color: 'var(--color-t-c1)',
    fontFamily: '"Rajdhani", sans-serif',
    fontSize: 16,
    padding: '10px 12px',
    outline: 'none',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  }

  const buttonStyle: React.CSSProperties = {
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
  }

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: 480, padding: '0 24px', textAlign: 'center', position: 'relative' }}>

        <div style={{
          fontFamily: '"Barlow Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(62px, 17vw, 96px)',
          color: 'var(--color-t-c4)',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          LAZY GAFFER
        </div>

        <div style={{ borderBottom: '4px solid var(--color-t-c2)', marginBottom: 32 }} />

        {stage === 'email' ? (
          <>
            <div style={{ color: 'var(--color-t-c1)', fontSize: 14, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>
              Enter your email to sign in
            </div>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendCode()}
              placeholder="YOUR EMAIL ADDRESS"
              autoCapitalize="off"
              autoCorrect="off"
              style={inputStyle}
            />

            {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <button onClick={handleSendCode} disabled={loading} style={buttonStyle}>
              {loading ? 'SENDING...' : 'SEND CODE'}
            </button>

            {onCancel && (
              <button onClick={onCancel} style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--color-t-c1)', fontFamily: '"Rajdhani", sans-serif', fontSize: 13, cursor: 'pointer', opacity: 0.6, padding: 0, textDecoration: 'underline' }}>
                CANCEL
              </button>
            )}
          </>
        ) : (
          <>
            <div style={{ color: 'var(--color-t-c1)', fontSize: 14, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
              Enter the 6-digit code sent to
            </div>
            <div style={{ color: 'var(--color-t-c4)', fontSize: 16, fontWeight: 700, marginBottom: 24 }}>
              {email}
            </div>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
              placeholder="000000"
              style={{ ...inputStyle, fontSize: 32, letterSpacing: 8 }}
            />

            {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <button onClick={handleVerifyCode} disabled={loading} style={buttonStyle}>
              {loading ? 'VERIFYING...' : 'SIGN IN'}
            </button>

            <button
              onClick={() => { setStage('email'); setError(''); setCode('') }}
              style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--color-t-c1)', fontFamily: '"Rajdhani", sans-serif', fontSize: 13, cursor: 'pointer', opacity: 0.6, padding: 0, textDecoration: 'underline' }}
            >
              Wrong email? Go back
            </button>

            {onCancel && (
              <button onClick={onCancel} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--color-t-c1)', fontFamily: '"Rajdhani", sans-serif', fontSize: 13, cursor: 'pointer', opacity: 0.6, padding: 0, textDecoration: 'underline', display: 'block', width: '100%' }}>
                CANCEL
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
