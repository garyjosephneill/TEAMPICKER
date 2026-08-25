import React, { useRef, useState, useEffect } from 'react'
import { BgScene, useRandomVariant } from './BgScene'

export default function LandingPage() {
  const { kitIndex, isGaffer, kit } = useRandomVariant()
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const [groupWidth, setGroupWidth] = useState<number>(600)
  const [measured, setMeasured] = useState(false)
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]
  const videoGroupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [])

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

  const handleEnded = (index: number) => {
    const next = index + 1
    if (next < videoRefs.length) {
      videoRefs[next].current?.play()
      setActiveVideo(next)
    } else {
      setActiveVideo(null)
    }
  }

  const lineWidth = groupWidth + 150

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>

      {/* Background */}
      <BgScene kit={kit} kitIndex={kitIndex} isGaffer={isGaffer} />

      {/* Content */}
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
              fontWeight: 700, fontSize: 'clamp(14px, 2vw, 20px)', letterSpacing: 2,
              color: kit.c1, textTransform: 'uppercase', lineHeight: 1.3,
            }}>RATE YOUR SQUAD, THEN LET THE GAFFER<br />PICK TWO PERFECTLY BALANCED TEAMS</div>
          </div>
        </div>

        {/* Videos */}
        <div style={{
          flex: 1, display: 'flex',
          justifyContent: 'center', alignItems: 'center',
          padding: '16px 0', minHeight: 0,
        }}>
          <div ref={videoGroupRef} style={{ display: 'flex', gap: 16, height: '100%', alignItems: 'center', width: 'fit-content' }}>
            {['vid-a.mov', 'vid-b.mov', 'vid-c.mov'].map((src, i) => (
              <div key={i} style={{ position: 'relative', cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center' }} onClick={() => toggleVideo(i)}>
                <video
                  ref={videoRefs[i]}
                  src={`/videos/${src}`}
                  playsInline
                  onEnded={() => handleEnded(i)}
                  style={{ height: '100%', maxHeight: '100%', width: 'auto', borderRadius: 16, display: 'block' }}
                />
                {activeVideo !== i && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 16,
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: 0, height: 0,
                        borderTop: '12px solid transparent',
                        borderBottom: '12px solid transparent',
                        borderLeft: '20px solid white',
                        marginLeft: 4,
                      }} />
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
              fontSize: 20, letterSpacing: 3, color: kit.c1,
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            DOWNLOAD ON THE APP STORE
          </a>
        </div>

        {/* Ticker */}
        <div style={{ width: lineWidth, margin: '0 auto', overflow: 'hidden', flexShrink: 0, padding: '8px 0', opacity: measured ? 1 : 0 }}>
          <style>{`
            @keyframes ticker {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
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
          <p style={{
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 8,
            letterSpacing: 1, color: kit.c1, opacity: 0.5,
            textTransform: 'uppercase', margin: '0 0 4px',
          }}>
            Gary Neill Limited &nbsp;|&nbsp; Company No. 4741682
          </p>
          <p style={{ margin: 0 }}>
            <a href="/privacy" style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 8,
              letterSpacing: 1, color: kit.c1, opacity: 0.5,
              textTransform: 'uppercase', textDecoration: 'underline',
            }}>Privacy Policy</a>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 8, color: kit.c1, opacity: 0.3, margin: '0 6px' }}>|</span>
            <a href="/privacy#terms" style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 8,
              letterSpacing: 1, color: kit.c1, opacity: 0.5,
              textTransform: 'uppercase', textDecoration: 'underline',
            }}>Terms &amp; Conditions</a>
          </p>
        </div>

      </div>
    </div>
  )
}
