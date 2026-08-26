import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { BgScene, useRandomVariant } from './BgScene'

const VIDEOS = ['vid-a.mov', 'vid-b.mov', 'vid-c.mov']

function MobileLayout({ kit, kitIndex, isGaffer, mobileIndex, mobilePlaying, sliding, hasTransitioned, mobileVideoRef, VIDEOS, POSTERS, handleMobilePlay, handleMobilePause, handleMobileEnded }: any) {
  const [showControls, setShowControls] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const scheduleHide = () => {
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 1000)
  }

  const handleVideoAreaTap = () => {
    if (!showControls) {
      setShowControls(true)
      // don't auto-hide — user needs to tap button to act
    } else if (mobilePlaying) {
      handleMobilePause()
      scheduleHide()
    }
    // if paused and controls visible, the button itself handles play
  }

  const handlePlayTap = () => {
    handleMobilePlay()
    scheduleHide()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <BgScene kit={kit} kitIndex={kitIndex} isGaffer={isGaffer} />
      <style>{`
        @keyframes slideOut {
          from { transform: translateY(0); opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Spacer to push video down */}
      <div style={{ height: '8%', flexShrink: 0 }} />

      {/* Video area */}
      {/* Outer wrapper fills remaining space and centres the video box */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 5%' }}>
        {/* Inner box: exact video aspect ratio, no dead space */}
        <div
          style={{ position: 'relative', width: '100%', aspectRatio: '886 / 1920', maxHeight: '100%' }}
          onClick={handleVideoAreaTap}
        >
          <div
            key={mobileIndex}
            style={{
              position: 'absolute', inset: 0,
              animation: sliding ? 'slideOut 0.4s ease forwards' : hasTransitioned ? 'slideIn 0.4s ease forwards' : undefined,
            }}
          >
            <video
              ref={mobileVideoRef}
              src={`/videos/${VIDEOS[mobileIndex]}`}
              poster={POSTERS[mobileIndex]}
              playsInline
              preload="none"
              onEnded={handleMobileEnded}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Controls overlay */}
          {showControls && (
            <div
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 2,
              }}
              onClick={e => { e.stopPropagation(); mobilePlaying ? (() => { handleMobilePause(); scheduleHide() })() : handlePlayTap() }}
            >
              {mobilePlaying ? (
                <>
                  <div style={{ width: 8, height: 28, background: 'white', borderRadius: 2, marginRight: 6 }} />
                  <div style={{ width: 8, height: 28, background: 'white', borderRadius: 2 }} />
                </>
              ) : (
                <div style={{ width: 0, height: 0, borderTop: '18px solid transparent', borderBottom: '18px solid transparent', borderLeft: '30px solid white', marginLeft: 6 }} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Download button */}
      <div style={{ flexShrink: 0, padding: '16px 24px', paddingBottom: 'max(25px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 2 }}>
        <a
          href="https://apps.apple.com/gb/app/lazy-gaffer/id6760719368"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center',
            border: `4px solid ${kit.c1}`, padding: '12px 32px',
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
            fontSize: 'clamp(16px, 5vw, 22px)', letterSpacing: 3, color: kit.c1,
            textTransform: 'uppercase', textDecoration: 'none',
            background: 'rgba(0,0,0,0.4)', whiteSpace: 'nowrap',
          }}
        >
          DOWNLOAD ON APP STORE
        </a>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { kitIndex, isGaffer, kit } = useRandomVariant()

  // Desktop state
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]
  const videoGroupRef = useRef<HTMLDivElement>(null)
  const [groupWidth, setGroupWidth] = useState<number>(600)
  const [measured, setMeasured] = useState(false)

  // Mobile state
  const [isMobile] = useState(() => window.innerWidth < 768)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [mobilePlaying, setMobilePlaying] = useState(false)
  const [sliding, setSliding] = useState(false)
  const [hasTransitioned, setHasTransitioned] = useState(false)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)

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

  useEffect(() => {
    if (isMobile) setMeasured(true)
  }, [isMobile])

  const toggleVideo = (index: number) => {
    const ref = videoRefs[index].current
    if (!ref) return
    if (activeVideo === index && !ref.paused) {
      ref.pause()
      setActiveVideo(null)
    } else {
      videoRefs.forEach((r, i) => { if (i !== index && r.current) { r.current.pause(); r.current.currentTime = 0 } })
      ref.play()
      setActiveVideo(index)
    }
  }

  const handleDesktopEnded = (index: number) => {
    const next = index + 1
    if (next < videoRefs.length) {
      videoRefs[next].current?.play()
      setActiveVideo(next)
    } else {
      setActiveVideo(null)
    }
  }

  const handleMobilePlay = () => {
    mobileVideoRef.current?.play().catch(() => {})
    setMobilePlaying(true)
  }

  const handleMobilePause = () => {
    mobileVideoRef.current?.pause()
    setMobilePlaying(false)
  }

  const handleMobileEnded = () => {
    setSliding(true)
    setHasTransitioned(true)
    setTimeout(() => {
      const next = (mobileIndex + 1) % VIDEOS.length
      setMobileIndex(next)
      setMobilePlaying(false)
      setSliding(false)
      if (next !== 0) {
        setTimeout(() => {
          mobileVideoRef.current?.play().catch(() => {})
          setMobilePlaying(true)
        }, 50)
      }
    }, 400)
  }

  const maxWidth = window.innerWidth - 48
  const lineWidth = Math.min(groupWidth + 150, maxWidth)

  // ── Mobile: full-screen video layout ──────────────────────────────────────
  const POSTERS = ['/poster-a.jpg', '/poster-b.jpg', '/poster-c.jpg']

  if (isMobile) {
    return (
      <MobileLayout
        kit={kit} kitIndex={kitIndex} isGaffer={isGaffer}
        mobileIndex={mobileIndex} mobilePlaying={mobilePlaying}
        sliding={sliding} hasTransitioned={hasTransitioned}
        mobileVideoRef={mobileVideoRef} VIDEOS={VIDEOS} POSTERS={POSTERS}
        handleMobilePlay={handleMobilePlay} handleMobilePause={handleMobilePause}
        handleMobileEnded={handleMobileEnded}
      />
    )
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
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
