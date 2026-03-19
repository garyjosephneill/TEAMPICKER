import React, { useState } from 'react'
import { supabase } from './supabaseClient'
import { BgScene, useRandomVariant } from './BgScene'

export default function LoginScreen({ onCancel, initialEmail = '' }: { onCancel?: () => void; initialEmail?: string } = {}) {
  const { kitIndex, isGaffer, kit } = useRandomVariant()
  const [email, setEmail]   = useState(initialEmail)
  const [code, setCode]     = useState('')
  const [stage, setStage]   = useState<'email' | 'code'>(initialEmail ? 'code' : 'email')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [codeFocused, setCodeFocused]   = useState(false)

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

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'transparent',
    border: `4px solid ${kit.c4}`,
    color: kit.c1,
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700, fontSize: 24, letterSpacing: 2,
    padding: '10px 0', outline: 'none',
    textTransform: 'uppercase', textAlign: 'center',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>

      <BgScene kit={kit} kitIndex={kitIndex} isGaffer={isGaffer} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 660, width: '90%', textAlign: 'center', padding: '40px 48px', position: 'relative' }}>

          {/* Title */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: 96, lineHeight: 1,
            color: kit.c1, letterSpacing: '0.02em', marginBottom: 16,
          }}>LAZY GAFFER</div>

          {/* Separator */}
          <div style={{ borderBottom: `4px solid ${kit.c1}`, marginBottom: 24 }} />

          {onCancel && (
            <button onClick={onCancel} style={{
              position: 'absolute', top: 48, right: 48,
              background: 'none', border: 'none',
              color: kit.c1, fontFamily: "'Rajdhani', sans-serif",
              fontSize: 14, cursor: 'pointer', opacity: 0.6, padding: 0, letterSpacing: 1,
            }}>CANCEL</button>
          )}

          {stage === 'email' ? (
            <>
              {/* Subtitle */}
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700, fontSize: 22, letterSpacing: 2,
                color: kit.c1, textTransform: 'uppercase',
                lineHeight: 1.3, marginBottom: 32,
              }}>WHERE DO WE SEND YOUR LOG-IN CODE?</div>

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
                    ...inputStyle,
                    background: emailFocused ? kit.c4 : 'transparent',
                    color: emailFocused ? '#ffffff' : kit.c4,
                    WebkitBoxShadow: `0 0 0 1000px ${emailFocused ? kit.c4 : 'transparent'} inset`,
                    WebkitTextFillColor: emailFocused ? '#ffffff' : kit.c4,
                  }}
                />
              </div>

              {error && (
                <div style={{ color: '#ff6b6b', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginBottom: 12 }}>{error}</div>
              )}
            </>
          ) : (
            <>
              {/* Subtitle */}
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700, fontSize: 22, letterSpacing: 2,
                color: kit.c1, textTransform: 'uppercase',
                lineHeight: 1.3, marginBottom: 24,
              }}>
                ENTER THE 6-DIGIT CODE SENT TO<br />
                {email.toUpperCase()}
              </div>

              {/* Code input */}
              <div style={{ marginBottom: 20 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                  onFocus={() => setCodeFocused(true)}
                  onBlur={() => setCodeFocused(false)}
                  placeholder=">> 000000 <<"
                  style={{
                    ...inputStyle,
                    fontSize: 40, letterSpacing: 12,
                    background: codeFocused ? kit.c4 : 'transparent',
                    color: codeFocused ? '#ffffff' : kit.c4,
                    WebkitBoxShadow: `0 0 0 1000px ${codeFocused ? kit.c4 : 'transparent'} inset`,
                    WebkitTextFillColor: codeFocused ? '#ffffff' : kit.c4,
                    opacity: loading ? 0.6 : 1,
                  }}
                />
              </div>

              {error && (
                <div style={{ color: '#ff6b6b', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginBottom: 12 }}>{error}</div>
              )}

              <div
                onClick={() => { setStage('email'); setError(''); setCode('') }}
                style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: 13,
                  color: kit.c1, opacity: 0.6, cursor: 'pointer',
                  textDecoration: 'underline', letterSpacing: 1,
                }}
              >Wrong email? Go back</div>
            </>
          )}

        </div>
      </div>

    </div>
  )
}
