import React, { useState, useEffect, useRef } from 'react'
import { isNativeIOS, getProducts, purchaseProduct, restorePurchases } from './storekit'

const ANNUAL_ID = 'com.garyjosephneill.lazygaffer.annual'
const LIFETIME_ID = 'com.garyjosephneill.lazygaffer.lifetime'

type Product = { id: string; displayName: string; price: string; type: string }

export default function PaywallScreen({ userId, onLicensed, onLogin }: { userId: string; onLicensed: () => void; onLogin?: () => void }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const titleSpanRef = useRef<HTMLSpanElement>(null)
  const titleDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const span = titleSpanRef.current
    const div = titleDivRef.current
    if (!span || !div) return
    const measure = () => {
      let lo = 20, hi = 100
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2
        div.style.fontSize = mid + 'px'
        if (span.getBoundingClientRect().width <= 300) lo = mid
        else hi = mid
      }
      div.style.fontSize = lo + 'px'
      div.style.opacity = '1'
    }
    div.style.opacity = '0'
    document.fonts.ready.then(measure)
  }, [])

  useEffect(() => {
    if (isNativeIOS) {
      getProducts().then(setProducts).catch(console.error)
    }
  }, [])

  // Stripe return handling (web only)
  useEffect(() => {
    if (isNativeIOS) return
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

  const handleStoreKitPurchase = async (productId: string) => {
    setLoading(productId)
    setError(null)
    try {
      const result = await purchaseProduct(productId)
      if (result.success) {
        onLicensed()
      } else if (result.pending) {
        setError('Purchase is pending approval.')
      }
      // cancelled: do nothing
    } catch (err: any) {
      setError('Error: ' + (err?.message || err?.localizedDescription || String(err)))
    } finally {
      setLoading(null)
    }
  }

  const handleRestore = async () => {
    setLoading('restore')
    setError(null)
    try {
      const restored = await restorePurchases()
      if (restored) {
        onLicensed()
      } else {
        setError('No previous purchases found.')
      }
    } catch {
      setError('Restore failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleStripeSubscribe = async () => {
    setLoading('stripe')
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
      setLoading(null)
    }
  }

  if (checking) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#7A263A',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Barlow Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
        color: '#F3D459',
      }}>
        <div style={{ fontSize: 'clamp(48px, 12vw, 72px)' }}>LAZY GAFFER</div>
        <div style={{ fontSize: 18, color: '#fff', marginTop: 16, fontFamily: 'sans-serif' }}>
          Activating your account…
        </div>
      </div>
    )
  }

  const annualProduct = products.find(p => p.id === ANNUAL_ID)
  const lifetimeProduct = products.find(p => p.id === LIFETIME_ID)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#7A263A',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
      fontFamily: '"Rajdhani", sans-serif',
    }}>
      <div style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <div
          ref={titleDivRef}
          style={{
            fontFamily: '"Barlow Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: 52,
            fontWeight: 700,
            color: '#F3D459',
            lineHeight: 1,
            marginBottom: 8,
            whiteSpace: 'nowrap',
            opacity: 0,
          }}
        >
          <span ref={titleSpanRef}>LAZY GAFFER</span>
        </div>

        <div style={{ color: '#fff', fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
          Rate your squad, then let the Gaffer<br/>pick two balanced teams.
        </div>

        {isNativeIOS ? (
          <>
            <button
              onClick={() => handleStoreKitPurchase(ANNUAL_ID)}
              disabled={loading !== null}
              style={{
                background: 'var(--color-t-bg)', color: '#F3D459',
                border: '4px solid #F3D459', borderRadius: 0,
                padding: '12px 40px', fontSize: 24, fontWeight: 700,
                fontFamily: '"Rajdhani", sans-serif', letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: 12,
              }}
            >
              {loading === ANNUAL_ID ? 'Loading…' : 'Start free trial'}
            </button>

            {error && (
              <div style={{ color: '#ff6b6b', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>{error}</div>
            )}

            <button
              onClick={handleRestore}
              disabled={loading !== null}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                border: 'none', fontSize: 14, alignSelf: 'center',
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading === 'restore' ? 'Restoring…' : 'Restore purchases'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleStripeSubscribe}
              disabled={loading !== null}
              style={{
                background: 'var(--color-t-bg)', color: '#F3D459',
                border: '4px solid #F3D459', borderRadius: 0,
                padding: '12px 40px', fontSize: 24, fontWeight: 700,
                fontFamily: '"Rajdhani", sans-serif', letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: 16,
              }}
            >
              {loading ? 'Loading…' : 'Start free trial'}
            </button>

            <div style={{ color: '#F3D459', fontSize: 8, fontWeight: 700, textAlign: 'center' }}>
              14 days free, then £3.99 a year<br/>or £7.99 forever.
            </div>

            {onLogin && (
              <button
                onClick={onLogin}
                style={{
                  background: 'transparent', color: 'rgba(255,255,255,0.5)',
                  border: 'none', fontSize: 14, alignSelf: 'center', marginTop: 16,
                  cursor: 'pointer',
                }}
              >
                Already have an account? Log in
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
