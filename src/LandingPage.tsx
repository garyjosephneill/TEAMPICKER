import React, { useState } from 'react'
import { BgScene, useRandomVariant } from './BgScene'
import { supabase } from './supabaseClient'

export default function LandingPage() {
  const { kitIndex, isGaffer, kit } = useRandomVariant()
  const [email, setEmail]           = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [sent, setSent]             = useState(false)

  const handleSendLink = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { shouldCreateUser: true, emailRedirectTo: 'https://lazygaffer.com' }
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
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

          {sent ? (
            <div style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
              fontSize: 20, letterSpacing: 2, color: kit.c1,
              textTransform: 'uppercase', textAlign: 'center', marginBottom: 20,
            }}>
              CHECK YOUR EMAIL AND CLICK THE LINK TO LOG IN
            </div>
          ) : (
            <>
              {/* Email input */}
              <div style={{ marginBottom: 20 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendLink()}
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

        </div>
      </div>

    </div>
  )
}
