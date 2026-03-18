import React, { useState, useEffect } from 'react'
import { isNativeIOS, getProducts, purchaseProduct, restorePurchases } from './storekit'

const ANNUAL_ID = 'com.garyjosephneill.lazygaffer.annual'
const LIFETIME_ID = 'com.garyjosephneill.lazygaffer.lifetime'

type Product = { id: string; displayName: string; price: string; type: string }

export default function PaywallScreen({ userId, onLicensed }: { userId: string; onLicensed: () => void }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

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
    } catch {
      setError('Purchase failed. Please try again.')
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

  const annualProduct = products.find(p => p.id === ANNUAL_ID)
  const lifetimeProduct = products.find(p => p.id === LIFETIME_ID)

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

      {isNativeIOS ? (
        <>
          <button
            onClick={() => handleStoreKitPurchase(ANNUAL_ID)}
            disabled={loading !== null}
            style={{
              background: '#F3D459', color: '#7A263A',
              border: 'none', borderRadius: 12,
              padding: '16px 40px', fontSize: 20, fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: 12, width: '100%', maxWidth: 320,
            }}
          >
            {loading === ANNUAL_ID ? 'Loading…' : `Start 14-day free trial`}
          </button>

          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 }}>
            Then {annualProduct?.price ?? '£3.99'}/year — cancel anytime
          </div>

          <button
            onClick={() => handleStoreKitPurchase(LIFETIME_ID)}
            disabled={loading !== null}
            style={{
              background: 'transparent', color: '#F3D459',
              border: '2px solid #F3D459', borderRadius: 12,
              padding: '14px 40px', fontSize: 18, fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: 24, width: '100%', maxWidth: 320,
            }}
          >
            {loading === LIFETIME_ID ? 'Loading…' : `Lifetime — ${lifetimeProduct?.price ?? '£7.99'}`}
          </button>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 14, marginBottom: 12 }}>{error}</div>
          )}

          <button
            onClick={handleRestore}
            disabled={loading !== null}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              border: 'none', fontSize: 14,
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
        </>
      )}
    </div>
  )
}
