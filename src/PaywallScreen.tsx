import React, { useState, useEffect } from 'react'

export default function PaywallScreen({ userId, onLicensed }: { userId: string; onLicensed: () => void }) {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)

  // If returning from Stripe checkout, poll until licensed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout_success') !== 'true') return

    setChecking(true)
    window.history.replaceState({}, '', '/')
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const res = await fetch(`/api/squad-status/${userId}`)
      const data = await res.json()
      if (data.is_licensed || attempts >= 12) {
        clearInterval(interval)
        if (data.is_licensed) onLicensed()
        else setChecking(false)
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#7A263A',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
        color: '#F3D459',
      }}>
        <div style={{ fontSize: 'clamp(48px, 12vw, 72px)' }}>LAZY GAFFER</div>
        <div style={{ fontSize: 18, color: '#fff', marginTop: 16, fontFamily: 'sans-serif' }}>
          Activating your account…
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#7A263A',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', textAlign: 'center',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        fontFamily: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: 'clamp(52px, 14vw, 80px)',
        color: '#F3D459',
        lineHeight: 1,
        marginBottom: 8,
      }}>
        LAZY GAFFER
      </div>

      <div style={{ color: '#fff', fontSize: 18, marginBottom: 32, maxWidth: 320 }}>
        Build and manage your squad, pick your teams, track every player.
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          background: '#F3D459', color: '#7A263A',
          border: 'none', borderRadius: 12,
          padding: '16px 40px', fontSize: 20, fontWeight: 700,
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginBottom: 12,
        }}
      >
        {loading ? 'Loading…' : 'Start free trial'}
      </button>

      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
        14 days free, then £3.99/year. Cancel anytime.
      </div>
    </div>
  )
}
