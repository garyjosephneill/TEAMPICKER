import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: string | null}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e: any) { return { error: e?.message || 'Unknown error' }; }
  render() {
    if (this.state.error) return (
      <div style={{ background: '#000', color: '#ff0', fontFamily: 'monospace', padding: 24, minHeight: '100vh' }}>
        <div style={{ fontSize: 18, marginBottom: 16 }}>APP ERROR</div>
        <div style={{ fontSize: 12, color: '#fff' }}>{this.state.error}</div>
      </div>
    );
    return this.props.children;
  }
}

enum Position { GKP = 'GKP', DEFENCE = 'DEFENCE', MIDFIELD = 'MIDFIELD', ATTACK = 'ATTACK' }
type StatKey = Position | 'NRG' | 'SPD';
interface Player { id: string; name: string; ratings: Record<StatKey, number>; position: Position; isSelected: boolean; }
interface Team { name: string; players: Player[]; totalRating: number; positions: Record<Position, number>; }

const DEFAULT_RATINGS = (): Record<StatKey, number> => ({
  [Position.GKP]: 5, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5, NRG: 5, SPD: 5
});

const TEAM_NAMES = [
  'UNITED', 'CITY', 'TOWN', 'ROVERS', 'ATHLETIC', 'WANDERERS',
  'RANGERS', 'COUNTY', 'ALBION', 'VILLA', 'ALEXANDRA', 'ORIENT',
  'BOROUGH', 'ACADEMICAL', 'FOREST', 'WEDNESDAY', 'PARK', 'VALE'
];

const FAMOUS_PLAYERS = [
  { name: 'THE CAT',    ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 6, SPD: 5 }, position: Position.GKP },
  { name: 'SIMMO',      ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 7, SPD: 6 }, position: Position.GKP },
  { name: 'CHOPPER',    ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 9, SPD: 5 }, position: Position.DEFENCE },
  { name: 'BIG JOHN',   ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 7, SPD: 4 }, position: Position.DEFENCE },
  { name: 'FRANCO',     ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 8, SPD: 7 }, position: Position.DEFENCE },
  { name: 'BARRY',      ratings: { GKP: 5, DEFENCE: 5, MIDFIELD: 5, ATTACK: 5, NRG: 6, SPD: 5 }, position: Position.DEFENCE },
  { name: 'BONES',      ratings: { GKP: 5, DEFENCE: 5, MIDFIELD: 5, ATTACK: 5, NRG: 7, SPD: 6 }, position: Position.DEFENCE },
  { name: 'LUNGS',      ratings: { GKP: 8, DEFENCE: 8, MIDFIELD: 8, ATTACK: 8, NRG: 10,SPD: 8 }, position: Position.MIDFIELD },
  { name: 'TRICKY PETE',ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 7, SPD: 9 }, position: Position.MIDFIELD },
  { name: 'WOR DAVE',   ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 8, SPD: 7 }, position: Position.MIDFIELD },
  { name: 'GADGET',     ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 8, SPD: 8 }, position: Position.MIDFIELD },
  { name: 'SWEATY',     ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 9, SPD: 6 }, position: Position.MIDFIELD },
  { name: 'BOBBY SCORE',ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 8, SPD: 9 }, position: Position.ATTACK },
  { name: 'GAZADONNA',  ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 7, SPD: 10}, position: Position.ATTACK },
  { name: 'THE POSTMAN',ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 6, SPD: 7 }, position: Position.ATTACK },
  { name: 'SNIFFER',    ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 7, SPD: 8 }, position: Position.ATTACK },
  { name: 'LITTLE JOHN',ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 6, SPD: 6 }, position: Position.ATTACK },
  { name: 'GAV',        ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 7, SPD: 8 }, position: Position.ATTACK },
];

const RANDOM_MM2_RATINGS = (): Record<StatKey, number> => {
  const r = () => Math.floor(Math.random() * 7) + 4;
  return {
    [Position.GKP]: r(),
    [Position.DEFENCE]: r(),
    [Position.MIDFIELD]: r(),
    [Position.ATTACK]: r(),
    NRG: r(),
    SPD: r(),
  };
};

const GET_RANDOM_16 = (): Player[] => {
  const shuffled = [...FAMOUS_PLAYERS].sort(() => 0.5 - Math.random());
  const defenders = shuffled.filter(p => p.position === Position.DEFENCE).slice(0, 2);
  const midfielders = shuffled.filter(p => p.position === Position.MIDFIELD).slice(0, 2);
  const remaining = shuffled.filter(p => !defenders.includes(p) && !midfielders.includes(p));
  const selected16 = [...defenders, ...midfielders, ...remaining.slice(0, 12)].sort(() => 0.5 - Math.random());
  const selectedIds = new Set(selected16.sort(() => 0.5 - Math.random()).slice(0, 10).map(p => p.name));
  return selected16.map(p => ({ ...p, id: crypto.randomUUID(), isSelected: selectedIds.has(p.name), ratings: RANDOM_MM2_RATINGS() }));
};

function TapZone({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = React.useState(24);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.getBoundingClientRect().width;
      const gap = 3 * 9;
      setCellSize(Math.floor((w - gap) / 10));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '100%', gap: '3px', overflow: 'hidden' }}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          onClick={() => onChange(i + 1)}
          style={{
            width: cellSize,
            height: cellSize,
            flexShrink: 0,
            flexGrow: 0,
            cursor: 'pointer',
            backgroundColor: i < value ? `var(--color-${color})` : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const cached = localStorage.getItem('ceefax_players_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return GET_RANDOM_16();
  });
  const [view, setView] = useState<'selection' | 'squad' | 'payment' | 'settings'>('squad');
  const [appMode, setAppMode] = useState<'MM1' | 'MM2'>('MM2');
  const [teams, setTeams] = useState<{ team1: Team; team2: Team } | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [squadId] = useState<string>(() => {
    const id = localStorage.getItem('ceefax_squad_id');
    if (id) return id;
    const newId = Math.floor(100 + Math.random() * 900).toString();
    localStorage.setItem('ceefax_squad_id', newId);
    return newId;
  });
  const [newPlayerName, setNewPlayerName] = useState('');
  const [splashKit, setSplashKit] = useState(0);
  const [splashDone, setSplashDone] = useState(false);
  const [activeKit, setActiveKit] = useState<any>(null);
  const [kitsView, setKitsView] = useState(false);
  const [transfersView, setTransfersView] = useState(false);
  const [transferCandidate, setTransferCandidate] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const swipeStartX = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const addRowRef = useRef<HTMLDivElement>(null);
  const teamsContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const playerCardRefs = useRef<Record<string, HTMLElement | null>>({});

  const KITS = [
    { name: 'ARSENAL',          bg: '#EF0107', c1: '#ffffff', c2: '#ffffff', c3: '#9C824A', c4: '#9C824A' },
    { name: 'ASTON VILLA',      bg: '#7ab4e3', c1: '#ffffff', c2: '#670E36', c3: '#ffd600', c4: '#670E36' },
    { name: 'BOURNEMOUTH',      bg: '#DA291C', c1: '#ffffff', c2: '#000000', c3: '#000000', c4: '#000000' },
    { name: 'BRENTFORD',        bg: '#e30613', c1: '#ffffff', c2: '#ffffff', c3: '#000000', c4: '#000000' },
    { name: 'BRIGHTON',         bg: '#0057B8', c1: '#ffffff', c2: '#ffffff', c3: '#ffcd00', c4: '#ffcd00' },
    { name: 'CHELSEA',          bg: '#034694', c1: '#ffffff', c2: '#ffffff', c3: '#DBA111', c4: '#DBA111' },
    { name: 'CRYSTAL PALACE',   bg: '#1B458F', c1: '#ffffff', c2: '#d4d1d2', c3: '#d2d2d2', c4: '#C4122E' },
    { name: 'EVERTON',          bg: '#003399', c1: '#ffffff', c2: '#ffffff', c3: '#ffdf1c', c4: '#ffdf1c' },
    { name: 'FULHAM',           bg: '#ffffff', c1: '#000000', c2: '#ce0007', c3: '#CC0000', c4: '#ce0007', lightBg: true },
    { name: 'IPSWICH',          bg: '#0044A9', c1: '#ffffff', c2: '#ffffff', c3: '#de2d26', c4: '#de2d26' },
    { name: 'LEICESTER',        bg: '#003090', c1: '#ffffff', c2: '#FDBE11', c3: '#FDBE11', c4: '#FDBE11' },
    { name: 'LIVERPOOL',        bg: '#b20622', c1: '#ffffff', c2: '#0bc9b0', c3: '#F6EB61', c4: '#fced5e' },
    { name: 'MAN CITY',         bg: '#6CABDD', c1: '#ffffff', c2: '#1C2C5B', c3: '#1C2C5B', c4: '#1C2C5B' },
    { name: 'MAN UTD',          bg: '#DA291C', c1: '#000000', c2: '#ffffff', c3: '#ffffff', c4: '#FBE122' },
    { name: 'NEWCASTLE',        bg: '#030000', c1: '#ffffff', c2: '#ffffff', c3: '#41B0E4', c4: '#41B0E4' },
    { name: 'NOTT\'M FOREST',   bg: '#DD0000', c1: '#ffffff', c2: '#030000', c3: '#000000', c4: '#000000' },
    { name: 'SOUTHAMPTON',      bg: '#D71920', c1: '#ffffff', c2: '#ffffff', c3: '#FFC20E', c4: '#FFC20E' },
    { name: 'SPURS',            bg: '#132257', c1: '#ffffff', c2: '#bcbec0', c3: '#BCBEC0', c4: '#ffffff' },
    { name: 'WEST HAM',         bg: '#7A263A', c1: '#ffffff', c2: '#1BB1E7', c3: '#1BB1E7', c4: '#F3D459' },
    { name: 'WOLVES',           bg: '#e27c2f', c1: '#000000', c2: '#ffffff', c3: '#FFFFFF', c4: '#231F20' },
  ];

  const SPLASH_KITS = KITS.slice(0, 12).sort(() => Math.random() - 0.5);

  useEffect(() => {
    const saved = localStorage.getItem('lazy_gaffer_kit');
    const appKit = saved ? JSON.parse(saved) : KITS[Math.floor(Math.random() * KITS.length)];
    setActiveKit(appKit);
    const root = document.documentElement;
    
    // Slowed opening cycle to 400ms (50% slower than previous 200ms)
    let i = 0;
    const interval = setInterval(() => {
      if (i < SPLASH_KITS.length) {
        root.style.setProperty('--color-t-bg', SPLASH_KITS[i].bg);
        setSplashKit(i);
        i++;
      } else {
        clearInterval(interval);
        root.style.setProperty('--color-t-bg', appKit.bg);
        root.style.setProperty('--color-t-c1', appKit.c1);
        root.style.setProperty('--color-t-c2', appKit.c2);
        root.style.setProperty('--color-t-c3', appKit.c3);
        root.style.setProperty('--color-t-c4', appKit.c4);
        setSplashDone(true);
      }
    }, 400); 
    return () => clearInterval(interval);
  }, []);

  const handleSwipeStart = (id: string, x: number) => { if (deleteMode) { setSwipingId(id); swipeStartX.current = x; } };
  const handleSwipeMove = (x: number) => { if (swipingId) setSwipeX(Math.max(0, swipeStartX.current - x)); };
  const handleSwipeEnd = () => { if (swipingId && swipeX > 80) setPlayers(p => p.filter(x => x.id !== swipingId)); setSwipingId(null); setSwipeX(0); };

  const toggleExpanded = (id: string) => {
    setExpandedPlayers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getEffectiveRating = (p: Player) => (Object.values(p.ratings).reduce((a, b) => a + b, 0) / 6).toFixed(1);

  const addPlayer = () => {
    if (!newPlayerName) return;
    setPlayers([{ id: crypto.randomUUID(), name: newPlayerName.toUpperCase(), ratings: RANDOM_MM2_RATINGS(), position: Position.ATTACK, isSelected: true }, ...players]);
    setNewPlayerName('');
  };

  if (!splashDone) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-t-bg)', fontFamily: 'Bebas Neue' }}>
      <span style={{ fontSize: '10vw', color: 'white' }}>LAZY GAFFER</span>
    </div>
  );

  return (
    <ErrorBoundary>
    <div className="flex flex-col h-[100dvh] bg-t-bg text-t-c1 uppercase" style={{ fontFamily: 'Bebas Neue', maxWidth: '1024px', margin: '0 auto' }}>
      <header className="p-4 border-b-4 border-t-c2">
        <div className="flex justify-between items-center">
          <h1 className="text-5xl text-t-c4">LAZY GAFFER</h1>
          <button onClick={() => setView(view === 'settings' ? 'squad' : 'settings')} className="text-2xl">⚙</button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4">
        {view === 'squad' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="ADD PLAYER..." className="flex-grow bg-transparent border-2 border-t-c2 p-2 outline-none" />
              <button onClick={addPlayer} className="bg-t-c3 text-t-bg px-6 font-bold">ADD</button>
            </div>
            {/* Desktop 3-column grid enabled via minmax 300px */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
              {players.map(p => (
                <div key={p.id} className="border-b-2 border-t-c2 py-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xl">{p.name}</span>
                    <button onClick={() => toggleExpanded(p.id)} className="border-2 border-t-c1 px-2">{getEffectiveRating(p)}</button>
                  </div>
                  {expandedPlayers.has(p.id) && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(p.ratings).map(([stat, val]) => (
                        <div key={stat} className="flex justify-between border-b border-t-c1/20">
                          <span>{stat}</span><span>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl border-b-2 border-t-c4 pb-2">CHOOSE KIT</h2>
            <div className="grid grid-cols-2 gap-2">
              {KITS.map(k => (
                <button key={k.name} onClick={() => { setActiveKit(k); localStorage.setItem('lazy_gaffer_kit', JSON.stringify(k)); window.location.reload(); }} className="p-2 border-2 border-t-c1" style={{ backgroundColor: k.bg, color: k.c1 }}>{k.name}</button>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="p-4 flex gap-4 border-t-4 border-t-c2">
        <button onClick={() => setView('squad')} className={`flex-1 p-2 border-4 ${view === 'squad' ? 'bg-t-c2 text-t-bg' : 'border-t-c2'}`}>SQUAD</button>
        <button onClick={() => setView('selection')} className={`flex-1 p-2 border-4 ${view === 'selection' ? 'bg-t-c3 text-t-bg' : 'border-t-c3'}`}>GAFFER</button>
      </nav>
    </div>
    </ErrorBoundary>
  );
}