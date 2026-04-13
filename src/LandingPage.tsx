import React, { useState } from 'react'
import { BgScene, useRandomVariant } from './BgScene'
import { supabase } from './supabaseClient'

export default function LandingPage() {
  const { kitIndex, isGaffer, kit } = useRandomVariant()
  const [email, setEmail]           = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [stage, setStage]           = useState<'email' | 'code'>('email')
  const [code, setCode]             = useState('')

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

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>

      <BgScene kit={kit} kitIndex={kitIndex} isGaffer={isGaffer} />

      {/* Layer 3: landing content */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 660, width: '90%', textAlign: 'center', padding: '40px 48px' }}>

          {/* Title */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: 96, lineHeight: 1,
            color: kit.c1, letterSpacing: '0.02em', marginBottom: 16,
          }}>LAZY GAFFER</div>

          {/* Separator */}
          <div style={{ borderBottom: `4px solid ${kit.c1}`, marginBottom: 24 }} />

          {/* Subtitle */}
          <div style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700, fontSize: 24, letterSpacing: 2,
            color: kit.c1, textTransform: 'uppercase',
            lineHeight: 1.3, marginBottom: 32,
          }}>RATE YOUR SQUAD, THEN LET THE GAFFER<br />PICK TWO PERFECTLY BALANCED TEAMS</div>

          {stage === 'code' ? (
            <>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                fontSize: 16, letterSpacing: 2, color: kit.c4,
                textTransform: 'uppercase', textAlign: 'center', marginBottom: 8,
              }}>
                ENTER THE 8-DIGIT CODE SENT TO
              </div>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                fontSize: 18, color: kit.c1, marginBottom: 20,
              }}>
                {email}
              </div>
              <div style={{ marginBottom: 20 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                  placeholder="00000000"
                  autoCapitalize="off"
                  autoCorrect="off"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: `4px solid ${kit.c4}`,
                    padding: '10px',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 700, fontSize: 32, letterSpacing: 8,
                    textAlign: 'center', outline: 'none',
                    background: 'transparent',
                    color: kit.c4,
                    opacity: loading ? 0.6 : 1,
                  }}
                />
              </div>
              {error && (
                <div style={{ color: '#ff6b6b', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginBottom: 12 }}>{error}</div>
              )}
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                style={{
                  width: '100%', background: 'none',
                  border: `4px solid ${kit.c2}`, color: kit.c2,
                  fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                  fontSize: 24, letterSpacing: 3, padding: '10px 0',
                  cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1,
                  marginBottom: 12,
                }}
              >
                {loading ? 'VERIFYING...' : 'SIGN IN'}
              </button>
              <button
                onClick={() => { setStage('email'); setError(''); setCode('') }}
                style={{ background: 'none', border: 'none', color: kit.c1, fontFamily: "'Rajdhani', sans-serif", fontSize: 13, cursor: 'pointer', opacity: 0.6, padding: 0, textDecoration: 'underline' }}
              >
                Wrong email? Go back
              </button>
            </>
          ) : (
            <>
              {/* Email input */}
              <div style={{ marginBottom: 20 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder=">> YOUR EMAIL ADDRESS <<"
                  autoCapitalize="off"
                  autoCorrect="off"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: `4px solid ${kit.c4}`,
                    padding: '10px',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 700, fontSize: 20, letterSpacing: 2,
                    textTransform: 'uppercase', textAlign: 'center', outline: 'none',
                    background: emailFocused ? kit.c4 : 'transparent',
                    color: emailFocused ? '#ffffff' : kit.c4,
                    WebkitBoxShadow: `0 0 0 1000px ${emailFocused ? kit.c4 : 'transparent'} inset`,
                    WebkitTextFillColor: emailFocused ? '#ffffff' : kit.c4,
                    opacity: loading ? 0.6 : 1,
                  }}
                />
              </div>

              {error && (
                <div style={{ color: '#ff6b6b', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginBottom: 12 }}>{error}</div>
              )}
            </>
          )}

          {/* Scrolling ticker */}
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <style>{`
              @keyframes ticker {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            <div style={{
              display: 'inline-flex',
              animation: 'ticker 8s linear infinite',
              whiteSpace: 'nowrap',
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700, fontSize: 12, letterSpacing: 2,
                  color: kit.c1, textTransform: 'uppercase',
                  paddingRight: 48,
                }}>14-DAY FREE TRIAL</span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700, fontSize: 8, letterSpacing: 2,
              color: kit.c1, opacity: 0.5, textTransform: 'uppercase',
              margin: '0 0 4px',
            }}>
              Gary Neill Limited &nbsp;|&nbsp; Company No. 4741682
            </p>
            <p style={{ margin: 0 }}>
              <a href="/privacy" style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700, fontSize: 8, letterSpacing: 2,
                color: kit.c1, opacity: 0.5, textTransform: 'uppercase',
                textDecoration: 'underline',
              }}>
                Privacy Policy
              </a>
              <span style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 8, color: kit.c1, opacity: 0.3, margin: '0 8px',
              }}>|</span>
              <a href="/privacy#terms" style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700, fontSize: 8, letterSpacing: 2,
                color: kit.c1, opacity: 0.5, textTransform: 'uppercase',
                textDecoration: 'underline',
              }}>
                Terms &amp; Conditions
              </a>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
