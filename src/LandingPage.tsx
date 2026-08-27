import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { BgScene, useRandomVariant } from './BgScene'

const VIDEOS = ['vid-a.mov', 'vid-b.mov', 'vid-c.mov']
const TITLE_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const CAROUSEL_COUNT = 21

// Sampled directly from the edge pixels of each image
const TITLE_BG: Record<string, string> = {
  A: '#346E9A', B: '#420712', C: '#860A0F',
  D: '#036E2E', E: '#C74A04', F: '#D9DFE1', G: '#9C5604',
}
const SLIDE_BG = ['#F6CF46','#F6CF46','#F6CF46','#F6CF46','#5E1737','#5E1737','#5E1737','#5E1737','#5E1737','#5E1737','#CCCCCC','#1F2C59','#1F2C59','#12356D','#B5B5B5','#000000','#FFFFFF','#1F2C58','#1F2C58','#7EA9DE','#7F060A']
const slideBg = (i: number) => SLIDE_BG[i] ?? '#111111'

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
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHoriz = useRef<boolean | null>(null)

  useEffect(() => {
    const fadeOut = setTimeout(() => setTitleOpacity(0), 1250)
    const show = setTimeout(() => setShowCarousel(true), 1750)
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
    setSlideDir(next > slide ? 'left' : 'right')
    setPrevSlide(slide)
    slideRef.current = next
    setSlide(next)
    setTimeout(() => { setPrevSlide(null); transitioning.current = false }, 350)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHoriz.current = null
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY
    const dx = Math.abs(touchStartX.current - e.changedTouches[0].clientX)
    if (Math.abs(dy) > 40 && Math.abs(dy) > dx) goTo(dy > 0 ? slide + 1 : slide - 1)
  }

  // Native touchmove only — needed for passive:false so we can call preventDefault
  useEffect(() => {
    if (!showCarousel) return
    const el = carouselRef.current
    if (!el) return
    const onMove = (e: TouchEvent) => {
      if (isHoriz.current === null) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
        const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
        if (dx > 4 || dy > 4) isHoriz.current = dx > dy
      }
      if (!isHoriz.current) e.preventDefault()
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [showCarousel])

  const bg = showCarousel ? slideBg(slide) : TITLE_BG[titleKey]

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', overflow: 'hidden', background: bg }}>
      <style>{`
        @keyframes slideInFromRight { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes slideInFromLeft  { from { transform: translateY(-100%) } to { transform: translateY(0) } }
        @keyframes slideOutToLeft   { from { transform: translateY(0) } to { transform: translateY(-100%) } }
        @keyframes slideOutToRight  { from { transform: translateY(0) } to { transform: translateY(100%) } }
        @keyframes fadeIn           { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* Title screen */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        opacity: titleOpacity, transition: 'opacity 0.5s ease',
        pointerEvents: titleOpacity === 0 ? 'none' : 'auto',
      }}>
        <img src={`/mobile/title/${titleKey}.jpg`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>

      {/* Carousel */}
      {showCarousel && (
        <div
          ref={carouselRef}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden', animation: 'fadeIn 0.5s ease forwards' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Outgoing slide */}
          {prevSlide !== null && (
            <div style={{
              position: 'absolute', inset: 0,
              animation: `${slideDir === 'left' ? 'slideOutToLeft' : 'slideOutToRight'} 0.35s ease forwards`,
            }}>
              <img src={`/desktop/carousel/${prevSlide + 1}.jpg`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
          )}

          {/* Current slide */}
          <div style={{
            position: 'absolute', inset: 0,
            animation: prevSlide !== null
              ? `${slideDir === 'left' ? 'slideInFromRight' : 'slideInFromLeft'} 0.35s ease forwards`
              : undefined,
          }}>
            <img src={`/desktop/carousel/${slide + 1}.jpg`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>

          {/* Side dots — left edge, vertical */}
          <div style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, zIndex: 5,
          }}>
            {Array.from({ length: CAROUSEL_COUNT }).map((_, i) => (
              <div key={i} onClick={() => goTo(i)} style={{
                width: 5,
                height: i === slide ? 16 : 5,
                borderRadius: 3,
                background: i === slide ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'height 0.3s, background 0.3s',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            ))}
          </div>

          {/* Last slide — whole image is tappable */}
          {slide === CAROUSEL_COUNT - 1 && (
            <a
              href="https://apps.apple.com/gb/app/lazy-gaffer/id6760719368"
              target="_blank" rel="noopener noreferrer"
              style={{ position: 'absolute', inset: 0, zIndex: 5 }}
              aria-label="Download on App Store"
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Desktop: carousel experience ──────────────────────────────────────────────
const DESKTOP_TITLE_BG = '#F6CF46'
const DESKTOP_TITLE_COLOR = '#1F2C59'

function DesktopCarousel() {
  const [titleOpacity, setTitleOpacity] = useState(1)
  const [showCarousel, setShowCarousel] = useState(false)
  const [slide, setSlide] = useState(0)
  const [prevSlide, setPrevSlide] = useState<number | null>(null)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left')
  const transitioning = useRef(false)
  const slideRef = useRef(0)

  // Title screen: hold 10s, fade 0.5s, then show carousel
  const titleTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const skipTitle = () => {
    titleTimers.current.forEach(clearTimeout)
    setTitleOpacity(0)
    setTimeout(() => setShowCarousel(true), 500)
  }
  useEffect(() => {
    const fadeOut = setTimeout(() => setTitleOpacity(0), 10000)
    const show    = setTimeout(() => setShowCarousel(true), 10500)
    titleTimers.current = [fadeOut, show]
    return () => { clearTimeout(fadeOut); clearTimeout(show) }
  }, [])

  useEffect(() => {
    const bg = showCarousel ? slideBg(slide) : DESKTOP_TITLE_BG
    setBg(bg)
    return () => {
      document.body.style.removeProperty('background')
      document.documentElement.style.removeProperty('background')
    }
  }, [showCarousel, slide])

  const goTo = (next: number) => {
    const cur = slideRef.current
    if (next < 0 || next >= CAROUSEL_COUNT || transitioning.current) return
    transitioning.current = true
    setSlideDir(next > cur ? 'left' : 'right')
    setPrevSlide(cur)
    slideRef.current = next
    setSlide(next)
    setTimeout(() => { setPrevSlide(null); transitioning.current = false }, 350)
  }

  // Keyboard left/right navigation — uses refs so the stale closure is safe
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(slideRef.current + 1)
      if (e.key === 'ArrowLeft')  goTo(slideRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const inAnim  = `${slideDir === 'left' ? 'deskSlideInR' : 'deskSlideInL'} 0.35s ease forwards`
  const outAnim = `${slideDir === 'left' ? 'deskSlideOutL' : 'deskSlideOutR'} 0.35s ease forwards`

  const arrowStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    [side]: 24,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    color: 'white',
    fontSize: 32,
    width: 48,
    height: 48,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    userSelect: 'none',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes deskSlideInR  { from { transform: translateX(100%)  } to { transform: translateX(0) } }
        @keyframes deskSlideInL  { from { transform: translateX(-100%) } to { transform: translateX(0) } }
        @keyframes deskSlideOutL { from { transform: translateX(0) } to { transform: translateX(-100%) } }
        @keyframes deskSlideOutR { from { transform: translateX(0) } to { transform: translateX(100%)  } }
      `}</style>

      {/* Title screen — click anywhere to skip */}
      <div
        onClick={skipTitle}
        style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: DESKTOP_TITLE_BG,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 10vw',
          opacity: titleOpacity, transition: 'opacity 0.5s ease',
          pointerEvents: titleOpacity === 0 ? 'none' : 'auto',
          cursor: 'pointer',
        }}
      >
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(72px, 14vw, 160px)',
          color: DESKTOP_TITLE_COLOR,
          letterSpacing: '0.02em',
          lineHeight: 1,
          textAlign: 'center',
        }}>LAZY GAFFER</div>

        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: DESKTOP_TITLE_COLOR,
          textAlign: 'center',
          marginTop: '0.75em',
          lineHeight: 1.5,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: 0.85,
        }}>
          Rate your squad once, select who's playing that week, tap generate teams, that's it.<br />
          The Gaffer will then pick two fair, perfectly balanced teams, no arguments, no moaning.<br />
          Free 14-day trial, no ads, download on the App Store or go to lazygaffer.com
        </div>
      </div>

      {/* Outgoing slide */}
      {prevSlide !== null && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: outAnim }}>
          <img
            src={`/desktop/carousel/${prevSlide + 1}.jpg`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none', pointerEvents: 'none' }}
          />
        </div>
      )}

      {/* Current slide */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: prevSlide !== null ? inAnim : undefined }}>
        <img
          src={`/desktop/carousel/${slide + 1}.jpg`}
          alt={`Slide ${slide + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none', pointerEvents: 'none' }}
        />
      </div>

      {/* Left arrow */}
      {slide > 0 && (
        <button onClick={() => goTo(slideRef.current - 1)} style={arrowStyle('left')} aria-label="Previous slide">‹</button>
      )}

      {/* Right arrow */}
      {slide < CAROUSEL_COUNT - 1 && (
        <button onClick={() => goTo(slideRef.current + 1)} style={arrowStyle('right')} aria-label="Next slide">›</button>
      )}

      {/* Last slide — whole screen links to App Store */}
      {slide === CAROUSEL_COUNT - 1 && (
        <a
          href="https://apps.apple.com/gb/app/lazy-gaffer/id6760719368"
          target="_blank" rel="noopener noreferrer"
          style={{ position: 'absolute', inset: 0, zIndex: 5 }}
          aria-label="Download on App Store"
        />
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
  return <DesktopCarousel />

  // ── Desktop layout (original — kept for easy revert) ────────────────────────
  // eslint-disable-next-line no-unreachable
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
