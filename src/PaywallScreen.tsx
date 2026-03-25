import React, { useState, useEffect, useRef, useMemo } from 'react'
import { isNativeIOS, getProducts, purchaseProduct, restorePurchases } from './storekit'

const ANNUAL_ID = 'com.garyjosephneill.lazygaffer.annual'
const LIFETIME_ID = 'com.garyjosephneill.lazygaffer.lifetime'

type Product = { id: string; displayName: string; price: string; type: string }

// Paywall-specific kits — 4 colours, independent of landing page
const PAYWALL_KITS = [
  { bg: '#00843D', c1: '#ffffff', c4: '#FFD700' }, // Australia green
  { bg: '#5EB6E4', c1: '#ffffff', c4: '#000000' }, // Uruguay blue
  { bg: '#FF4F00', c1: '#ffffff', c4: '#003DA5' }, // Netherlands orange
  { bg: '#7ab4e3', c1: '#ffffff', c4: '#670E36' }, // Aston Villa blue
]

const SPLASH_COLOURS = ['#00843D', '#5EB6E4', '#FF4F00', '#7ab4e3']
const splashColour = SPLASH_COLOURS[Math.floor(Math.random() * SPLASH_COLOURS.length)]

const isCheckoutReturn = !isNativeIOS && new URLSearchParams(window.location.search).get('checkout_success') === 'true'
const forceIOSPreview = new URLSearchParams(window.location.search).get('ios') === '1'
const showAsIOS = isNativeIOS || forceIOSPreview

export default function PaywallScreen({ userId, onLicensed }: { userId: string; onLicensed: () => void }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [autoRedirecting, setAutoRedirecting] = useState(!isNativeIOS && !forceIOSPreview && !isCheckoutReturn)
  const [kitIdx, setKitIdx] = useState(() => Math.floor(Math.random() * PAYWALL_KITS.length))
  const kit = PAYWALL_KITS[kitIdx]
  const titleSpanRef = useRef<HTMLSpanElement>(null)
  const titleDivRef = useRef<HTMLDivElement>(null)

  const DEMO_NAMES = ['SIMMO', 'TOM D', 'ROLANDO', 'ALEX', 'AREK', 'ANDY', 'PHILL', 'CHARLIE', 'TOM R', 'STEVE H', 'PRINCE', 'GAZ']
  const STAT_LABELS = ['GKP', 'DEF', 'MID', 'ATT', 'SPD', 'NRG']

  const demoStats = useMemo(() => {
    const pool = Array.from({ length: 10 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, 6)
  }, [kitIdx])

  const demoName = useMemo(() =>
    DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)]
  , [kitIdx])

  const demoRating = useMemo(() =>
    (demoStats.reduce((a, b) => a + b, 0) / demoStats.length).toFixed(1)
  , [demoStats])

  // Cycle through kits every 20 seconds
  useEffect(() => {
    if (!showAsIOS) return
    const interval = setInterval(() => {
      setKitIdx(i => (i + 1) % PAYWALL_KITS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const span = titleSpanRef.current
    const div = titleDivRef.current
    if (!span || !div) return
    const measure = () => {
      const maxWidth = div.parentElement?.getBoundingClientRect().width ?? div.getBoundingClientRect().width
      let lo = 20, hi = 150
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2
        div.style.fontSize = mid + 'px'
        if (span.getBoundingClientRect().width <= maxWidth) lo = mid
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

  // Stripe auto-redirect (web only, not returning from checkout)
  useEffect(() => {
    if (!autoRedirecting) return
    handleStripeSubscribe().catch(() => setAutoRedirecting(false))
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
      try {
        const res = await fetch(`/api/squad-status/${userId}`)
        const data = await res.json()
        console.log(`[checkout] poll ${attempts}: is_licensed=${data.is_licensed}`)
        if (data.is_licensed) { clearInterval(interval); onLicensed(); return }
      } catch { /* network error — keep polling */ }
      if (attempts >= 20) { clearInterval(interval); setChecking(false) }
    }, 1500)
    return () => clearInterval(interval)
  }, [userId])

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
      setAutoRedirecting(false)
    }
  }

  if (autoRedirecting || checking) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: splashColour,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {checking && (
          <div style={{
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
            fontSize: 18, letterSpacing: 2, color: '#ffffff',
            textTransform: 'uppercase', textAlign: 'center',
          }}>Setting up your account…</div>
        )}
      </div>
    )
  }

  const annualProduct = products.find(p => p.id === ANNUAL_ID)
  const lifetimeProduct = products.find(p => p.id === LIFETIME_ID)
  const annualPrice = annualProduct?.price ?? '£3.99'
  const lifetimePrice = lifetimeProduct?.price ?? '£7.99'

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>

      {showAsIOS ? (
        <div style={{
          position: 'fixed', inset: 0,
          background: kit.bg,
          transition: 'background-color 1.5s ease',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '180px 36px 48px', boxSizing: 'border-box',
          fontFamily: '"Rajdhani", sans-serif',
        }}>

          {/* Top: title + rule + subtitle */}
          <div style={{ width: '100%', maxWidth: 320 }}>
            <div
              ref={titleDivRef}
              style={{
                fontFamily: '"Barlow Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 52, fontWeight: 700,
                color: kit.c1, lineHeight: 1,
                marginBottom: 12, whiteSpace: 'nowrap', opacity: 0,
              }}
            >
              <span ref={titleSpanRef}>LAZY GAFFER</span>
            </div>

            <div style={{ borderBottom: `4px solid ${kit.c1}`, marginBottom: 16 }} />

            <div style={{
              color: kit.c1, fontSize: 16, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase',
              textAlign: 'center', lineHeight: 1.3,
            }}>
              RATE YOUR SQUAD, THEN LET<br />THE GAFFER PICK TWO TEAMS
            </div>
          </div>

          {/* Middle: decorative tap zone — changes with each kit cycle */}
          <div style={{ width: '100%', maxWidth: 320, position: 'relative' }}>
            <div>
              {STAT_LABELS.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <span style={{ width: 36, paddingLeft: 5, flexShrink: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, color: kit.c1 }}>{label}</span>
                  <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div key={j} style={{ flex: 1, aspectRatio: '1', backgroundColor: j < demoStats[i] ? kit.c1 : 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* 95% wash overlay */}
            <div style={{ position: 'absolute', inset: 0, background: kit.bg, opacity: 0.80, transition: 'background-color 1.5s ease', pointerEvents: 'none' }} />
          </div>

          {/* Bottom: price + button + restore + legal */}
          <div style={{ width: '100%', maxWidth: 320 }}>

            {/* Price — dominant element per Apple guideline 3.1.2(c) */}
            <div style={{
              color: kit.c4, fontSize: 32, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase',
              textAlign: 'center', lineHeight: 1, marginBottom: 16,
              transition: 'color 1.5s ease',
            }}>
              {annualPrice} A YEAR
            </div>

            <button
              onClick={() => handleStoreKitPurchase(ANNUAL_ID)}
              disabled={loading !== null}
              style={{
                width: '100%',
                background: 'transparent', color: kit.c1,
                border: `4px solid ${kit.c1}`, borderRadius: 0,
                transition: 'border-color 1.5s ease, color 1.5s ease',
                WebkitTapHighlightColor: kit.c4,
                padding: '14px 0', fontSize: 24, fontWeight: 700,
                fontFamily: '"Rajdhani", sans-serif', letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginBottom: 20,
              }}
            >
              {loading === ANNUAL_ID ? 'LOADING…' : 'FREE 14-DAY TRIAL'}
            </button>

            {error && (
              <div style={{ color: '#ff6b6b', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>{error}</div>
            )}

            <button
              onClick={handleRestore}
              disabled={loading !== null}
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: 'transparent', color: kit.c4,
                border: 'none', fontSize: 13, fontWeight: 700,
                transition: 'color 1.5s ease',
                fontFamily: '"Rajdhani", sans-serif', letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: loading ? 'default' : 'pointer',
                marginBottom: 10,
              }}
            >
              {loading === 'restore' ? 'RESTORING…' : 'RESTORE PURCHASES'}
            </button>

            <div style={{
              display: 'flex', justifyContent: 'center', gap: 16,
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              fontFamily: '"Rajdhani", sans-serif', textTransform: 'uppercase',
            }}>
              <a
                href="https://lazygaffer.com/privacy"
                target="_blank" rel="noopener noreferrer"
                style={{ color: kit.c4, textDecoration: 'none' }}
              >
                PRIVACY POLICY
              </a>
              <span style={{ color: kit.c4 }}>·</span>
              <a
                href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                target="_blank" rel="noopener noreferrer"
                style={{ color: kit.c4, textDecoration: 'none' }}
              >
                TERMS OF USE
              </a>
            </div>
          </div>

        </div>
      ) : (
        // Web branch — unchanged
        <div style={{
          position: 'fixed', inset: 0, background: '#7A263A',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 24px',
          fontFamily: '"Rajdhani", sans-serif',
        }}>
          <div style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{
              fontFamily: '"Barlow Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 52, fontWeight: 700, color: '#F3D459',
              lineHeight: 1, marginBottom: 8, whiteSpace: 'nowrap',
            }}>
              LAZY GAFFER
            </div>
            <div style={{ color: '#fff', fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
              Rate your squad, then let the Gaffer<br />pick two balanced teams.
            </div>
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
                opacity: loading ? 0.7 : 1, marginBottom: 16,
              }}
            >
              {loading ? 'Loading…' : 'Start free trial'}
            </button>
            <div style={{ color: '#F3D459', fontSize: 8, fontWeight: 700, textAlign: 'center' }}>
              14 days free, then £3.99 a year<br />or £7.99 forever.
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
