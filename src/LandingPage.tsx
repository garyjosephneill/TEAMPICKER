import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { BgScene, useRandomVariant } from './BgScene'

const VIDEOS = ['vid-a.mov', 'vid-b.mov', 'vid-c.mov']
const TITLE_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const CAROUSEL_COUNT = 10

// Sampled directly from the edge pixels of each image
const TITLE_BG: Record<string, string> = {
  A: '#346E9A', B: '#420712', C: '#860A0F',
  D: '#036E2E', E: '#C74A04', F: '#D9DFE1', G: '#9C5604',
}
const slideBg = (i: number) => i < 4 ? '#FED500' : '#BDBEC0'

function setBg(color: string) {
  document.body.style.setProperty('background', color, 'important')
  document.documentElement.style.setProperty('background', color, 'important')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', color)
}

// ── Mobile: carousel experience ───────────────────────────────────────────────
function MobileLayout() {
  const [titleKey] = useState(() => TITLE_KEYS[Math.floor(Math.random() * TITLE_KEYS.length)])
  const [titleOpacity, setTitleOpacity] = useState(1)
  const [showCarousel, setShowCarousel] = useState(false)
  const [slide, setSlide] = useState(0)
  const [prevSlide, setPrevSlide] = useState<number | null>(null)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left')
  const transitioning = useRef(false)
  const slideRef = useRef(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fadeOut = setTimeout(() => setTitleOpacity(0), 2500)
    const show = setTimeout(() => setShowCarousel(true), 3300)
    return () => { clearTimeout(fadeOut); clearTimeout(show) }
  }, [])

  // Keep body/theme-color in sync so system UI strips blend with the image
  useEffect(() => {
    const bg = showCarousel ? slideBg(slide) : TITLE_BG[titleKey]
    setBg(bg)
    return () => {
      document.body.style.removeProperty('background')
      document.documentElement.style.removeProperty('background')
    }
  }, [showCarousel, slide, titleKey])

  const goTo = (next: number) => {
    if (next < 0 || next >= CAROUSEL_COUNT || transitioning.current) return
    transitioning.current = true
    setSlideDir(next > slideRef.current ? 'left' : 'right')
    setPrevSlide(slideRef.current)
    slideRef.current = next
    setSlide(next)
    setTimeout(() => { setPrevSlide(null); transitioning.current = false }, 350)
  }

  // Native touch handlers — must run after carousel mounts (showCarousel:true)
  useEffect(() => {
    if (!showCarousel) return
    const el = carouselRef.current
    if (!el) return
    let startX = 0, startY = 0, isH: boolean | null = null
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; isH = null
    }
    const onMove = (e: TouchEvent) => {
      if (isH === null) {
        const dx = Math.abs(e.touches[0].clientX - startX)
        const dy = Math.abs(e.touches[0].clientY - startY)
        if (dx > 4 || dy > 4) isH = dx > dy
      }
      if (isH) e.preventDefault()
    }
    const onEnd = (e: TouchEvent) => {
      if (!isH) return
      const dx = startX - e.changedTouches[0].clientX
      if (Math.abs(dx) > 40) goTo(dx > 0 ? slideRef.current + 1 : slideRef.current - 1)
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [showCarousel])

  const bg = showCarousel ? slideBg(slide) : TITLE_BG[titleKey]

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', overflow: 'hidden', background: bg }}>
      <style>{`
        @keyframes slideInFromRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes slideInFromLeft  { from { transform: translateX(-100%) } to { transform: translateX(0) } }
        @keyframes slideOutToLeft   { from { transform: translateX(0) } to { transform: translateX(-100%) } }
        @keyframes slideOutToRight  { from { transform: translateX(0) } to { transform: translateX(100%) } }
        @keyframes fadeIn           { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* Title screen */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        opacity: titleOpacity, transition: 'opacity 0.8s ease',
        pointerEvents: titleOpacity === 0 ? 'none' : 'auto',
      }}>
        <img src={`/mobile/title/${titleKey}.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      {/* Carousel */}
      {showCarousel && (
        <div
          ref={carouselRef}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden', animation: 'fadeIn 0.5s ease forwards' }}
        >
          {/* Outgoing slide */}
          {prevSlide !== null && (
            <div style={{
              position: 'absolute', inset: 0,
              animation: `${slideDir === 'left' ? 'slideOutToLeft' : 'slideOutToRight'} 0.35s ease forwards`,
            }}>
              <img src={`/mobile/carousel/${prevSlide + 1}.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Current slide */}
          <div style={{
            position: 'absolute', inset: 0,
            animation: prevSlide !== null
              ? `${slideDir === 'left' ? 'slideInFromRight' : 'slideInFromLeft'} 0.35s ease forwards`
              : undefined,
          }}>
            <img src={`/mobile/carousel/${slide + 1}.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>

          {/* Progress dots */}
          <div style={{
            position: 'absolute', bottom: 'max(24px, env(safe-area-inset-bottom))',
            left: 0, right: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, zIndex: 5,
          }}>
            {Array.from({ length: CAROUSEL_COUNT }).map((_, i) => (
              <div key={i} onClick={() => goTo(i)} style={{
                width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
                background: i === slide ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'width 0.3s, background 0.3s',
                cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }} />
            ))}
          </div>

          {/* Download CTA on last slide */}
          {slide === CAROUSEL_COUNT - 1 && (
            <div style={{
              position: 'absolute',
              bottom: 'max(80px, calc(env(safe-area-inset-bottom) + 56px))',
              left: 24, right: 24, zIndex: 5,
              animation: 'fadeIn 0.5s ease forwards',
            }}>
              <a
                href="https://apps.apple.com/gb/app/lazy-gaffer/id6760719368"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center',
                  background: '#CC0000', color: 'white', padding: '16px 24px',
                  fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                  fontSize: 20, letterSpacing: 3,
                  textTransform: 'uppercase', textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                DOWNLOAD ON APP STORE
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { kitIndex, isGaffer, kit } = useRandomVariant()

  const [isMobile] = useState(() => window.innerWidth < 768)

  // Desktop state
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]
  const videoGroupRef = useRef<HTMLDivElement>(null)
  const [groupWidth, setGroupWidth] = useState<number>(600)
  const [measured, setMeasured] = useState(false)

  useLayoutEffect(() => {
    if (isMobile) return
    const el = videoGroupRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setGroupWidth(entry.contentRect.width)
        setMeasured(true)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [isMobile])

  const toggleVideo = (index: number) => {
    const ref = videoRefs[index].current
    if (!ref) return
    if (activeVideo === index && !ref.paused) {
      ref.pause(); setActiveVideo(null)
    } else {
      videoRefs.forEach((r, i) => { if (i !== index && r.current) { r.current.pause(); r.current.currentTime = 0 } })
      ref.play(); setActiveVideo(index)
    }
  }

  const handleDesktopEnded = (index: number) => {
    const next = index + 1
    if (next < videoRefs.length) { videoRefs[next].current?.play(); setActiveVideo(next) }
    else setActiveVideo(null)
  }

  if (isMobile) return <MobileLayout />

  // ── Desktop layout ──────────────────────────────────────────────────────────
  const lineWidth = Math.min(groupWidth + 150, window.innerWidth - 48)

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <BgScene kit={kit} kitIndex={kitIndex} isGaffer={isGaffer} />
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 24px 0' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', flexShrink: 0, paddingBottom: 12 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 1,
            color: kit.c1, letterSpacing: '0.02em', marginBottom: 8,
          }}>LAZY GAFFER</div>
          <div style={{ width: lineWidth, margin: '0 auto', opacity: measured ? 1 : 0 }}>
            <div style={{ borderBottom: `4px solid ${kit.c1}`, marginBottom: 10 }} />
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700, fontSize: 'clamp(12px, 3.5vw, 20px)', letterSpacing: 2,
              color: kit.c1, textTransform: 'uppercase', lineHeight: 1.3, textAlign: 'center',
            }}>RATE YOUR SQUAD, THEN LET THE GAFFER<br />PICK TWO PERFECTLY BALANCED TEAMS</div>
          </div>
        </div>

        {/* Videos */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 0', minHeight: 0 }}>
          <div ref={videoGroupRef} style={{ display: 'flex', gap: 16, height: '100%', alignItems: 'center', width: 'fit-content' }}>
            {VIDEOS.map((src, i) => (
              <div key={i} style={{ position: 'relative', cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center' }} onClick={() => toggleVideo(i)}>
                <video
                  ref={videoRefs[i]}
                  src={`/videos/${src}`}
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={e => { e.currentTarget.currentTime = 0.001 }}
                  onEnded={() => handleDesktopEnded(i)}
                  style={{ height: '100%', maxHeight: '100%', width: 'auto', borderRadius: 16, display: 'block' }}
                />
                {activeVideo !== i && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid white', marginLeft: 4 }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div style={{ textAlign: 'center', flexShrink: 0, padding: '12px 0' }}>
          <a
            href="https://apps.apple.com/gb/app/lazy-gaffer/id6760719368"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              border: `4px solid ${kit.c1}`, padding: '10px 32px',
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
              fontSize: 'clamp(14px, 4vw, 20px)', letterSpacing: 3, color: kit.c1, whiteSpace: 'nowrap',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            DOWNLOAD ON APP STORE
          </a>
        </div>

        {/* Ticker */}
        <div style={{ width: lineWidth, margin: '0 auto', overflow: 'hidden', flexShrink: 0, padding: '8px 0', opacity: measured ? 1 : 0 }}>
          <div style={{ display: 'inline-flex', animation: 'ticker 17.1s linear infinite', whiteSpace: 'nowrap' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700, fontSize: 12, letterSpacing: 2,
                color: kit.c1, textTransform: 'uppercase', paddingRight: 48,
              }}>NEW SEASON OFFER &nbsp;/&nbsp; £1.99 A YEAR &nbsp;/&nbsp; FREE 14 DAY TRIAL &nbsp;/&nbsp; NO ADS &nbsp;/&nbsp; OFFER ENDS JAN 2027</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', flexShrink: 0, padding: '10px 0 16px' }}>
          <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: 1, color: kit.c1, opacity: 0.5, textTransform: 'uppercase', margin: '0 0 4px' }}>
            Gary Neill Limited &nbsp;|&nbsp; Company No. 4741682
          </p>
          <p style={{ margin: 0 }}>
            <a href="/privacy" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: 1, color: kit.c1, opacity: 0.5, textTransform: 'uppercase', textDecoration: 'underline' }}>Privacy Policy</a>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 8, color: kit.c1, opacity: 0.3, margin: '0 6px' }}>|</span>
            <a href="/privacy#terms" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: 1, color: kit.c1, opacity: 0.5, textTransform: 'uppercase', textDecoration: 'underline' }}>Terms &amp; Conditions</a>
          </p>
        </div>

      </div>
    </div>
  )
}
