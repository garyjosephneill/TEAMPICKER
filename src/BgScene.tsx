import React, { useMemo } from 'react'

// ── Kit definitions ──────────────────────────────────────────────────────────
export const LANDING_KITS = [
  { name: 'AUSTRALIA',   bg: '#00843D', c1: '#ffffff', c2: '#FFD700', c3: '#FFD700', c4: '#FFD700' },
  { name: 'URUGUAY',     bg: '#5EB6E4', c1: '#ffffff', c2: '#000000', c3: '#FFC905', c4: '#000000' },
  { name: 'NETHERLANDS', bg: '#FF4F00', c1: '#ffffff', c2: '#003DA5', c3: '#003DA5', c4: '#003DA5' },
] as const

export type Kit = typeof LANDING_KITS[number]

export function useRandomVariant() {
  const variant  = useMemo(() => Math.floor(Math.random() * 6), [])
  const kitIndex = variant % 3
  const isGaffer = variant >= 3
  const kit      = LANDING_KITS[kitIndex]
  return { variant, kitIndex, isGaffer, kit }
}

// ── Static data ───────────────────────────────────────────────────────────────
const SQUAD = [
  { name: 'SIMMO',   rating: '7.2', stats: null },
  { name: 'TOM D',   rating: '6.8', stats: null },
  { name: 'ROLANDO', rating: '6.0', stats: null },
  { name: 'ALEX',    rating: '5.5', stats: [7, 9, 3, 4, 5, 2] },
  { name: 'AREK',    rating: '5.7', stats: [8, 7, 4, 4, 5, 3] },
  { name: 'ANDY',    rating: '4.7', stats: [5, 5, 2, 5, 4, 3] },
  { name: 'PHILL',   rating: '4.8', stats: null },
  { name: 'CHARLIE', rating: '5.3', stats: null },
  { name: 'TOM R',   rating: '5.8', stats: null },
  { name: 'STEVE H', rating: '5.5', stats: [5, 5, 7, 4, 5, 2] },
  { name: 'PRINCE',  rating: '7.0', stats: [4, 6, 4, 9, 8, 8] },
  { name: 'GAZ',     rating: '6.0', stats: [3, 5, 5, 8, 7, 6] },
]

const STAT_LABELS = ['GKP', 'DEF', 'MID', 'ATT', 'SPD', 'NRG']

const GAFFER_DATA = [
  {
    t1: { name: 'ALEXANDRA', rtg: '36.2', players: [
      { n: 'ROLANDO', pos: 'GKP', r: '6' }, { n: 'TOM R', pos: 'DEF', r: '5.8' },
      { n: 'AREK', pos: 'DEF', r: '5.7' },  { n: 'GAZ', pos: 'MID', r: '6' },
      { n: 'SIMMO', pos: 'ATT', r: '7.2' }, { n: 'STEVE H', pos: 'ATT', r: '5.5' },
    ]},
    t2: { name: 'PARK', rtg: '35.1', players: [
      { n: 'TOM D', pos: 'DEF', r: '6.8' }, { n: 'ALEX', pos: 'DEF', r: '5.5' },
      { n: 'PHILL', pos: 'DEF', r: '4.8' }, { n: 'ANDY', pos: 'MID', r: '5.7' },
      { n: 'PRINCE', pos: 'ATT', r: '7' },  { n: 'CHARLIE', pos: 'ATT', r: '5.3' },
    ]},
  },
  {
    t1: { name: 'ROVERS', rtg: '36.2', players: [
      { n: 'ROLANDO', pos: 'GKP', r: '6' }, { n: 'TOM R', pos: 'DEF', r: '5.8' },
      { n: 'AREK', pos: 'DEF', r: '5.7' },  { n: 'GAZ', pos: 'MID', r: '6' },
      { n: 'SIMMO', pos: 'ATT', r: '7.2' }, { n: 'STEVE H', pos: 'ATT', r: '5.5' },
    ]},
    t2: { name: 'WANDERERS', rtg: '35.1', players: [
      { n: 'TOM D', pos: 'DEF', r: '6.8' }, { n: 'ALEX', pos: 'DEF', r: '5.5' },
      { n: 'PHILL', pos: 'DEF', r: '4.8' }, { n: 'ANDY', pos: 'MID', r: '5.7' },
      { n: 'PRINCE', pos: 'ATT', r: '7' },  { n: 'CHARLIE', pos: 'ATT', r: '5.3' },
    ]},
  },
  {
    t1: { name: 'ALEXANDRA', rtg: '36.2', players: [
      { n: 'ROLANDO', pos: 'GKP', r: '6' }, { n: 'TOM R', pos: 'DEF', r: '5.8' },
      { n: 'AREK', pos: 'DEF', r: '5.7' },  { n: 'GAZ', pos: 'MID', r: '6' },
      { n: 'SIMMO', pos: 'ATT', r: '7.2' }, { n: 'STEVE H', pos: 'ATT', r: '5.5' },
    ]},
    t2: { name: 'PARK', rtg: '35.1', players: [
      { n: 'TOM D', pos: 'DEF', r: '6.8' }, { n: 'ALEX', pos: 'DEF', r: '5.5' },
      { n: 'PHILL', pos: 'DEF', r: '4.8' }, { n: 'ANDY', pos: 'MID', r: '5.7' },
      { n: 'PRINCE', pos: 'ATT', r: '7' },  { n: 'CHARLIE', pos: 'ATT', r: '5.3' },
    ]},
  },
]

const GAFFER_PLAYERS = ['SIMMO', 'TOM D', 'ROLANDO', 'ALEX', 'AREK', 'ANDY', 'PHILL', 'CHARLIE', 'TOM R', 'STEVE H', 'PRINCE', 'GAZ']

// ── Internal components ───────────────────────────────────────────────────────
function TapZone({ filled, color }: { filled: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3, width: '100%' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          flex: 1, aspectRatio: '1',
          backgroundColor: i < filled ? color : 'rgba(255,255,255,0.15)',
        }} />
      ))}
    </div>
  )
}

function AppHeader({ kit }: { kit: Kit }) {
  return (
    <header style={{ padding: '30px 16px 16px', flexShrink: 0 }}>
      <div style={{ marginBottom: 4, position: 'relative' }}>
        <div style={{
          fontSize: 60, fontWeight: 700, lineHeight: 1,
          fontFamily: "'Barlow Condensed', sans-serif", color: kit.c4,
        }}>LAZY GAFFER</div>
        <div style={{ position: 'absolute', right: 0, bottom: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
            <circle cx="12" cy="12" r="10" stroke={kit.c4} strokeWidth="1.5" />
            <polygon points="12,4 15,9 20,9 16,13 18,18 12,15 6,18 8,13 4,9 9,9" stroke={kit.c4} strokeWidth="1" fill="none" opacity="0.7" />
          </svg>
        </div>
      </div>
      <div style={{ borderBottom: `4px solid ${kit.c2}` }} />
    </header>
  )
}

function SquadBg({ kit }: { kit: Kit }) {
  const box2 = kit.c4
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', gap: 8, paddingTop: 8, paddingBottom: 30 }}>
        <div style={{
          flex: 1, height: 36, border: `2px solid ${kit.c2}`,
          padding: '0 8px', display: 'flex', alignItems: 'center',
          color: kit.c1, opacity: 0.5,
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 2,
          textTransform: 'uppercase',
        }}>ADD YOUR PLAYER . . .</div>
        <div style={{
          width: 72, height: 36, border: `2px solid ${kit.c3}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: kit.c3, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 2,
        }}>ADD</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 2rem' }}>
        {SQUAD.map(p => (
          <section key={p.name} style={{ borderBottom: `1px solid ${box2}`, paddingTop: 8, paddingBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                flex: 1, height: 36, border: `2px solid ${box2}`,
                padding: '0 8px', display: 'flex', alignItems: 'center',
                color: kit.c1, fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase',
              }}>{p.name}</div>
              <div style={{
                width: 72, height: 36, border: `2px solid ${box2}`,
                padding: '0 8px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexShrink: 0,
              }}>
                <span style={{ color: kit.c4, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18 }}>{p.rating}</span>
                <span style={{ color: kit.c1, opacity: 0.5, fontSize: 10 }}>{p.stats ? '▲' : '▼'}</span>
              </div>
            </div>
            {p.stats && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {STAT_LABELS.map((label, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      width: 36, paddingLeft: 5, flexShrink: 0,
                      fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12,
                      color: i % 2 === 0 ? kit.c3 : kit.c1,
                    }}>{label}</span>
                    <div style={{ flex: 1, minWidth: 0, marginLeft: -5 }}>
                      <TapZone filled={p.stats![i]} color={i % 2 === 0 ? kit.c3 : kit.c1} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function GafferBg({ kit, data }: { kit: Kit; data: typeof GAFFER_DATA[number] }) {
  const box1 = kit.c1
  const box2 = kit.c4
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {GAFFER_PLAYERS.map(name => (
          <div key={name} style={{
            padding: 8, border: `2px solid ${kit.c4}`,
            background: kit.c4, color: kit.bg,
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
            fontSize: 18, letterSpacing: 2, textTransform: 'uppercase',
          }}>{name}</div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 300, border: `4px solid ${kit.c4}`, padding: 8,
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: 24, letterSpacing: 2, textAlign: 'center',
          background: kit.bg, color: kit.c4,
        }}>GENERATE TEAMS</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {[{ ...data.t1, color: box1 }, { ...data.t2, color: box2 }].map(team => (
          <div key={team.name} style={{ border: `4px solid ${team.color}`, padding: 16, color: team.color }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', borderBottom: `2px solid ${team.color}`, marginBottom: 16, paddingBottom: 8 }}>
              <h3 style={{ flex: 1, fontSize: 24, margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{team.name}</h3>
              <span style={{ width: 64, fontSize: 20, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>RTG</span>
              <span style={{ width: 40, fontSize: 20, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{team.rtg}</span>
            </div>
            {team.players.map(p => (
              <div key={p.n} style={{ display: 'flex', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, textTransform: 'uppercase' }}>
                <span style={{ flex: 1 }}>{p.n}</span>
                <span style={{ width: 64 }}>{p.pos}</span>
                <span style={{ width: 40 }}>{p.r}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', width: 300, border: `4px solid ${box1}` }}>
          <div style={{ flex: 1, padding: 8, textAlign: 'center', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, background: kit.bg, color: box1 }}>HIDE INFO</div>
          <div style={{ flex: 1, padding: 8, textAlign: 'center', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, background: box1, color: kit.bg }}>SHOW INFO</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 300, border: `4px solid ${box2}`, padding: 8,
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: 24, letterSpacing: 2, textAlign: 'center',
          background: kit.bg, color: box2,
        }}>SHARE TEAMS</div>
      </div>
    </div>
  )
}

function BottomNav({ kit, isGaffer }: { kit: Kit; isGaffer: boolean }) {
  const box1 = kit.c1
  const box2 = kit.c4
  return (
    <div style={{ flexShrink: 0, background: kit.bg, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <nav style={{ display: 'flex', gap: 16 }}>
        <div style={{
          flex: 1, padding: '8px 0', border: `4px solid ${box1}`,
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: 24, textAlign: 'center', letterSpacing: 2,
          background: !isGaffer ? box1 : kit.bg, color: !isGaffer ? kit.bg : box1,
        }}>SQUAD</div>
        <div style={{
          flex: 1, padding: '8px 0', border: `4px solid ${box2}`,
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: 24, textAlign: 'center', letterSpacing: 2,
          background: isGaffer ? box2 : kit.bg, color: isGaffer ? kit.bg : box2,
        }}>GAFFER</div>
      </nav>
      <div style={{ textAlign: 'center', fontSize: 12, textTransform: 'none', fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, color: kit.c1 }}>
        Copyright - Gary Neill Limited
      </div>
    </div>
  )
}

// ── Exported background scene ─────────────────────────────────────────────────
export function BgScene({ kit, kitIndex, isGaffer }: { kit: Kit; kitIndex: number; isGaffer: boolean }) {
  return (
    <>
      {/* Layer 1: app UI replica */}
      <div style={{ position: 'absolute', inset: 0, background: kit.bg }}>
        <div style={{ width: '100%', maxWidth: 1024, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <AppHeader kit={kit} />
          <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px' }}>
            {isGaffer
              ? <GafferBg kit={kit} data={GAFFER_DATA[kitIndex]} />
              : <SquadBg kit={kit} />
            }
          </div>
          <BottomNav kit={kit} isGaffer={isGaffer} />
        </div>
      </div>

      {/* Layer 2: colour wash */}
      <div style={{ position: 'absolute', inset: 0, background: kit.bg, opacity: 0.90, pointerEvents: 'none' }} />
    </>
  )
}
