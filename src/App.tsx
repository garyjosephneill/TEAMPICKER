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
  const r = () => Math.floor(Math.random() * 10) + 1;
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

// Tap Zone — measures container, calculates exact square pixel size, sets width=height explicitly
function TapZone({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = React.useState(24);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.getBoundingClientRect().width;
      const gap = 3 * 9; // 9 gaps of 3px
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
          className={i < value ? color : 'bg-white/15'}
          style={{
            width: cellSize,
            height: cellSize,
            flexShrink: 0,
            flexGrow: 0,
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [view, setView] = useState<'selection' | 'squad' | 'payment'>('squad');
  const [appMode, setAppMode] = useState<'MM1' | 'MM2'>('MM1');
  const [teams, setTeams] = useState<{ team1: Team; team2: Team } | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [squadId] = useState<string>(() => {
    const id = localStorage.getItem('ceefax_squad_id');
    if (id) return id;
    const newId = Math.floor(100 + Math.random() * 900).toString();
    localStorage.setItem('ceefax_squad_id', newId);
    return newId;
  });
  const [squadStatus, setSquadStatus] = useState<any>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showPlayerDetails, setShowPlayerDetails] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const translateY = useRef(0);
  const teamsContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const playerCardRefs = useRef<Record<string, HTMLElement | null>>({});

  const toggleExpanded = (id: string) => {
    setExpandedPlayers(prev => {
      const next = new Set(prev);
      const isOpening = !next.has(id);
      isOpening ? next.add(id) : next.delete(id);
      if (isOpening) {
        setTimeout(() => {
          const card = playerCardRefs.current[id];
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      }
      return next;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const headerHeight = headerRef.current?.offsetHeight || 0;
    if (headerRef.current) {
      if (currentScrollY <= 5) {
        // Only show header when back at the very top
        translateY.current = 0;
      } else {
        // Hide immediately once scrolled away from top — never re-show mid-scroll
        translateY.current = -headerHeight;
      }
      headerRef.current.style.transform = `translateY(${translateY.current}px)`;
    }
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    if (headerRef.current) { translateY.current = 0; headerRef.current.style.transform = `translateY(0px)`; }
  }, [appMode, view]);

  useEffect(() => {
    fetch(`/api/squad-status/${squadId}`).then(r => r.json()).then(setSquadStatus);
    fetch(`/api/players/${squadId}`).then(r => r.json()).then(data => {
      if (data.length > 0) {
        setPlayers(data.map((p: any) => {
          const r = typeof p.ratings === 'string' ? JSON.parse(p.ratings) : p.ratings;
          const merged = { ...DEFAULT_RATINGS(), ...r };
          // If all positional ratings are equal, replace with randomised ratings
          const isFlat = merged[Position.GKP] === merged[Position.DEFENCE] &&
                         merged[Position.DEFENCE] === merged[Position.MIDFIELD] &&
                         merged[Position.MIDFIELD] === merged[Position.ATTACK];
          return { ...p, ratings: isFlat ? RANDOM_MM2_RATINGS() : merged };
        }));
      } else {
        setPlayers(GET_RANDOM_16());
      }
    });
  }, [squadId]);

  useEffect(() => {
    if (players.length === 0) return;
    const timer = setTimeout(() => {
      fetch(`/api/players/${squadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(players)
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [players, squadId]);

  const getEffectivePosition = (p: Player): Position => {
    if (appMode === 'MM2') {
      // Priority order: ATT > MID > DEF > GKP — so ties resolve towards outfield positions
      const priority = [Position.ATTACK, Position.MIDFIELD, Position.DEFENCE, Position.GKP];
      return priority.reduce((best, cur) => p.ratings[cur] > p.ratings[best] ? cur : best, Position.ATTACK);
    }
    return p.position;
  };

  const getEffectiveRating = (p: Player): number => {
    if (appMode === 'MM2') {
      const { GKP, DEFENCE, MIDFIELD, ATTACK, NRG, SPD } = p.ratings;
      return (GKP + DEFENCE + MIDFIELD + ATTACK + NRG + SPD) / 6;
    }
    return p.ratings[p.position];
  };

  const updateStat = (playerId: string, stat: StatKey, value: number) => {
    setPlayers(players.map(p =>
      p.id === playerId ? { ...p, ratings: { ...p.ratings, [stat]: value } } : p
    ));
  };

  const addPlayer = () => {
    if (!newPlayerName) return;
    const randomPosition = [Position.DEFENCE, Position.MIDFIELD, Position.ATTACK][Math.floor(Math.random() * 3)];
    setPlayers([...players, {
      id: crypto.randomUUID(),
      name: newPlayerName,
      ratings: RANDOM_MM2_RATINGS(),
      position: randomPosition,
      isSelected: true
    }]);
    setNewPlayerName('');
  };

  const balanceTeams = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1000);
    const selected = players.filter(p => p.isSelected);
    if (selected.length < 2) return;
    const t1: Player[] = [], t2: Player[] = [];
    const positions = [Position.GKP, Position.DEFENCE, Position.MIDFIELD, Position.ATTACK];
    const leftovers: Player[] = [];
    positions.forEach(pos => {
      const posPlayers = selected.filter(p => getEffectivePosition(p) === pos)
        .sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a));
      for (let i = 0; i < posPlayers.length; i += 2) {
        const p1 = posPlayers[i], p2 = posPlayers[i + 1];
        if (p2) {
          const t1R = t1.reduce((s, p) => s + getEffectiveRating(p), 0);
          const t2R = t2.reduce((s, p) => s + getEffectiveRating(p), 0);
          if (t1.length < t2.length) { t1.push(p1); t2.push(p2); }
          else if (t2.length < t1.length) { t2.push(p1); t1.push(p2); }
          else if (t1R < t2R) { t1.push(p1); t2.push(p2); }
          else if (t2R < t1R) { t2.push(p1); t1.push(p2); }
          else if (Math.random() > 0.5) { t1.push(p1); t2.push(p2); }
          else { t1.push(p2); t2.push(p1); }
        } else { leftovers.push(p1); }
      }
    });
    leftovers.sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a));
    leftovers.forEach(p => {
      const t1R = t1.reduce((s, x) => s + getEffectiveRating(x), 0);
      const t2R = t2.reduce((s, x) => s + getEffectiveRating(x), 0);
      if (t1.length < t2.length) t1.push(p);
      else if (t2.length < t1.length) t2.push(p);
      else if (t1R <= t2R) t1.push(p);
      else t2.push(p);
    });
    const sortOrder = { [Position.GKP]: 0, [Position.DEFENCE]: 1, [Position.MIDFIELD]: 2, [Position.ATTACK]: 3 };
    const sortPlayers = (ps: Player[]) => [...ps].sort((a, b) =>
      sortOrder[getEffectivePosition(a)] - sortOrder[getEffectivePosition(b)] || getEffectiveRating(b) - getEffectiveRating(a)
    );
    const shuffledNames = [...TEAM_NAMES].sort(() => 0.5 - Math.random());
    const createTeam = (name: string, ps: Player[]): Team => ({
      name, players: sortPlayers(ps),
      totalRating: ps.reduce((s, p) => s + getEffectiveRating(p), 0),
      positions: {
        [Position.GKP]: ps.filter(x => getEffectivePosition(x) === Position.GKP).length,
        [Position.DEFENCE]: ps.filter(x => getEffectivePosition(x) === Position.DEFENCE).length,
        [Position.MIDFIELD]: ps.filter(x => getEffectivePosition(x) === Position.MIDFIELD).length,
        [Position.ATTACK]: ps.filter(x => getEffectivePosition(x) === Position.ATTACK).length,
      }
    });
    setTeams({ team1: createTeam(shuffledNames[0], t1), team2: createTeam(shuffledNames[1], t2) });
    setTimeout(() => teamsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handlePurchase = async () => {
    await fetch(`/api/purchase/${squadId}`, { method: 'POST' });
    const status = await fetch(`/api/squad-status/${squadId}`).then(r => r.json());
    setSquadStatus(status);
    setView('squad');
  };

  const resetSquad = () => {
    const newId = Math.floor(100 + Math.random() * 900).toString();
    localStorage.setItem('ceefax_squad_id', newId);
    window.location.reload();
  };

  const handleShareTeams = () => {
    if (!teams) return;
    setIsSharing(true);
    setTimeout(() => setIsSharing(false), 1000);
    const formatTeam = (team: Team) => {
      let text = `${team.name}\n------------------------\n`;
      team.players.forEach(p => {
        if (showPlayerDetails) {
          const pos = getEffectivePosition(p).substring(0, 3);
          const rtg = getEffectiveRating(p) % 1 === 0 ? getEffectiveRating(p) : getEffectiveRating(p).toFixed(1);
          text += `${p.name} - ${pos} - ${rtg}\n`;
        } else { text += `${p.name}\n`; }
      });
      if (showPlayerDetails) {
        const totalRtg = team.totalRating % 1 === 0 ? team.totalRating : team.totalRating.toFixed(1);
        text += `------------------------\nTOTAL RTG: ${totalRtg}\n`;
      }
      return text;
    };
    const body = `${formatTeam(teams.team1)}\n\n${formatTeam(teams.team2)}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(`Teams for ${new Date().toLocaleDateString()}`)}&body=${encodeURIComponent(body)}`;
  };

  // MM2 stat definitions — tap zones alternate secondary / tertiary
  const MM2_STATS: { key: StatKey; label: string; textColor: string; fillColor: string }[] = [
    { key: Position.GKP,     label: 'GKP', textColor: 'text-t-secondary', fillColor: 'bg-t-secondary' },
    { key: Position.DEFENCE, label: 'DEF', textColor: 'text-t-tertiary',  fillColor: 'bg-t-tertiary'  },
    { key: Position.MIDFIELD,label: 'MID', textColor: 'text-t-secondary', fillColor: 'bg-t-secondary' },
    { key: Position.ATTACK,  label: 'ATT', textColor: 'text-t-tertiary',  fillColor: 'bg-t-tertiary'  },
    { key: 'SPD',            label: 'SPD', textColor: 'text-t-secondary', fillColor: 'bg-t-secondary' },
    { key: 'NRG',            label: 'NRG', textColor: 'text-t-tertiary',  fillColor: 'bg-t-tertiary'  },
  ];

  return (
    <ErrorBoundary>
    <div className="flex flex-col h-[100dvh] max-w-5xl mx-auto overflow-hidden bg-t-background text-white uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
      <main ref={mainRef} className="flex-grow overflow-y-auto relative" onScroll={handleScroll}>
        <header ref={headerRef} className="sticky top-0 z-10 bg-t-background p-4 pt-8 shrink-0">
          <div className="mb-[11px]">
            <div className="text-t-accent font-title font-normal text-[50px] tracking-normal uppercase">
              {appMode === 'MM1' ? 'MAN MANAGER' : 'MICRO MANAGER'}
            </div>
          </div>
          <div className="flex justify-between items-center text-sm font-bold border-b-4 border-t-primary pb-2">
            <div className="flex border-2 border-t-tertiary text-base font-bold">
              <button onClick={() => setAppMode('MM1')} className={`px-3 py-1 tracking-[0.2em] ${appMode === 'MM1' ? 'bg-t-tertiary text-t-background' : 'bg-t-background text-t-tertiary'}`}>MM1</button>
              <button onClick={() => setAppMode('MM2')} className={`px-3 py-1 border-l-2 border-t-tertiary tracking-[0.2em] ${appMode === 'MM2' ? 'bg-t-tertiary text-t-background' : 'bg-t-background text-t-tertiary'}`}>MM2</button>
            </div>
            {view === 'selection'
              ? <span className="text-t-tertiary">SELECTED {players.filter(x => x.isSelected).length}/{players.length}</span>
              : <span className="text-t-tertiary">PLAYERS: {players.length}</span>
            }
          </div>
        </header>

        <div className="p-4 space-y-6">

          {/* ── SQUAD VIEW ── */}
          {view === 'squad' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value.toUpperCase())}
                  placeholder="NAME . . ."
                  onKeyDown={e => e.key === 'Enter' && addPlayer()}
                  className="flex-1 bg-t-background border-2 border-t-primary text-white placeholder-white/30 uppercase outline-none px-2 font-bold"
                  style={{ height: 36, fontSize: '16px', letterSpacing: '2px' }}
                />
                <button
                  onClick={addPlayer}
                  className="flex-shrink-0 bg-t-background border-2 border-t-secondary text-t-secondary font-bold tracking-widest text-lg active:bg-t-secondary active:text-t-background transition-colors"
                  style={{ width: 88, height: 36 }}
                >ADD</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-0">
                {players.map((p) => {
                  const isExpanded = expandedPlayers.has(p.id);
                  const overallRating = appMode === 'MM2'
                    ? (Object.values(p.ratings).reduce((a, b) => a + b, 0) / 6).toFixed(1)
                    : p.ratings[p.position];

                  return (
                    <section key={p.id} ref={el => { playerCardRefs.current[p.id] = el; }} className="border-b border-gray-800 py-3">

                      {/* MM1 stars */}
                      {appMode === 'MM1' && (
                        <div className="flex justify-end mb-1 pt-4">
                          <div className="flex justify-between leading-none" style={{ width: 148, fontSize: '15px' }}>
                            {Array.from({ length: 10 }).map((_, idx) => (
                              <span key={idx} className={idx < p.ratings[p.position] ? 'text-t-accent' : 'text-white/20'}>★</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Name row */}
                      <div className="flex gap-2 items-center">
                        {editingPlayerId === p.id ? (
                          <input
                            autoFocus
                            value={p.name}
                            onBlur={() => setEditingPlayerId(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingPlayerId(null)}
                            onChange={e => setPlayers(players.map(x => x.id === p.id ? { ...x, name: e.target.value.toUpperCase() } : x))}
                            className="border-2 border-t-accent p-2 flex-1 text-sm bg-t-background text-ceefax-white uppercase outline-none font-bold h-[36px]"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingPlayerId(p.id)}
                            className="border-2 border-t-primary flex-1 text-sm text-ceefax-white truncate uppercase cursor-text font-bold flex items-center"
                            style={{ height: 36 }}
                          >
                            <span className="flex-1 truncate px-2" style={{ fontSize: '16px', letterSpacing: '2px' }}>{p.name}</span>
                          </div>
                        )}

                        {/* MM1: position toggle */}
                        {appMode === 'MM1' && (
                          <div className="flex border-2 border-t-tertiary overflow-hidden flex-shrink-0" style={{ height: 36 }}>
                            {([Position.GKP, Position.DEFENCE, Position.MIDFIELD, Position.ATTACK] as Position[]).map((pos, i, arr) => (
                              <button
                                key={pos}
                                onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: pos } : x))}
                                style={{ width: 36, height: 36, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                className={`text-[14px] md:text-[12px] font-bold tracking-wide flex-shrink-0 ${i < arr.length - 1 ? 'border-r-2 border-t-tertiary' : ''} ${p.position === pos
                                  ? 'bg-t-tertiary text-t-background'
                                  : 'bg-t-background text-white/75'}`}
                              >
                                {pos === Position.DEFENCE ? 'DEF' : pos === Position.MIDFIELD ? 'MID' : pos === Position.ATTACK ? 'ATT' : pos}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* MM2: overall + expand toggle */}
                        {appMode === 'MM2' && (
                          <button
                            onClick={() => toggleExpanded(p.id)}
                            className="flex items-center justify-between border-2 border-t-tertiary px-3 h-[36px] flex-shrink-0"
                            style={{ width: 88 }}
                          >
                            <span className="text-t-accent font-bold text-sm">{overallRating}</span>
                            <span className="text-white/50 text-xs">{isExpanded ? '▲' : '▼'}</span>
                          </button>
                        )}
                      </div>

                      {/* MM1: slider */}
                      {appMode === 'MM1' && (
                        <div className="flex items-center pb-4" style={{ marginTop: '18px' }}>
                          <input
                            type="range" min="1" max="10"
                            value={p.ratings[p.position]}
                            key={`${p.id}-${p.position}`}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              setPlayers(prev => prev.map(x => x.id === p.id ? {
                                ...x,
                                ratings: {
                                  ...x.ratings,
                                  [Position.GKP]: val,
                                  [Position.DEFENCE]: val,
                                  [Position.MIDFIELD]: val,
                                  [Position.ATTACK]: val,
                                }
                              } : x));
                            }}
                            onKeyUp={e => {
                              const val = parseInt((e.target as HTMLInputElement).value);
                              setPlayers(prev => prev.map(x => x.id === p.id ? {
                                ...x,
                                ratings: {
                                  ...x.ratings,
                                  [Position.GKP]: val,
                                  [Position.DEFENCE]: val,
                                  [Position.MIDFIELD]: val,
                                  [Position.ATTACK]: val,
                                }
                              } : x));
                            }}
                            className="w-full h-1 bg-white/75 appearance-none cursor-pointer"
                          />
                        </div>
                      )}

                      {/* MM2: expanded tap zones */}
                      {appMode === 'MM2' && isExpanded && (
                        <div className="mt-3 space-y-[6px]" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                          {MM2_STATS.map(stat => (
                            <div key={stat.key} style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                              <span className={`flex-shrink-0 font-bold ${stat.textColor}`} style={{ fontSize: '0.805rem', width: 32, marginRight: 4 }}>{stat.label}</span>
                              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                <TapZone
                                  value={p.ratings[stat.key]}
                                  onChange={v => updateStat(p.id, stat.key, v)}
                                  color={stat.fillColor}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      </section>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SELECTION / GAFFER VIEW ── */}
          {view === 'selection' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {players.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, isSelected: !x.isSelected } : x))}
                    className={`p-2 border-2 text-left text-sm transition-all font-bold ${p.isSelected ? 'bg-t-accent text-t-background border-t-accent' : 'bg-t-background text-ceefax-white border-white/20'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={balanceTeams}
                  className={`w-[300px] border-4 border-t-accent p-2 text-lg font-bold transition-all ${isGenerating ? 'bg-t-accent text-t-background' : 'text-t-accent bg-t-background'}`}
                >
                  GENERATE TEAMS
                </button>
              </div>
              {teams && (
                <div className="flex justify-center">
                  <div className="flex w-[300px] border-4 border-t-tertiary text-lg font-bold">
                    <button onClick={() => setShowPlayerDetails(false)} className={`flex-1 p-2 transition-all ${!showPlayerDetails ? 'bg-t-tertiary text-t-background' : 'bg-t-background text-t-tertiary'}`}>HIDE INFO</button>
                    <button onClick={() => setShowPlayerDetails(true)} className={`flex-1 p-2 transition-all ${showPlayerDetails ? 'bg-t-tertiary text-t-background' : 'bg-t-background text-t-tertiary'}`}>SHOW INFO</button>
                  </div>
                </div>
              )}
              {teams && (
                <div ref={teamsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {[
                    { data: teams.team1, color: 'text-t-primary', border: 'border-t-primary' },
                    { data: teams.team2, color: 'text-t-secondary', border: 'border-t-secondary' }
                  ].map(t => (
                    <div key={t.data.name} className={`border-4 ${t.border} p-4`}>
                      <div className="flex items-end border-b-2 border-white mb-4 pb-2">
                        <h3 className={`flex-1 text-2xl font-bold truncate pr-2 ${t.color}`}>{t.data.name}</h3>
                        {showPlayerDetails && (
                          <>
                            <span className="w-12 md:w-16 text-white text-base md:text-xl font-bold">RTG</span>
                            <span className="w-8 md:w-10 text-t-accent text-base md:text-xl font-bold">{t.data.totalRating % 1 === 0 ? t.data.totalRating : t.data.totalRating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                      {t.data.players.map(p => (
                        <div key={p.id} className="flex text-base md:text-xl">
                          <span className="flex-1 truncate pr-2">{p.name}</span>
                          {showPlayerDetails && (
                            <>
                              <span className="w-12 md:w-16 text-white">{getEffectivePosition(p).substring(0, 3)}</span>
                              <span className="w-8 md:w-10 text-t-accent">{getEffectiveRating(p) % 1 === 0 ? getEffectiveRating(p) : getEffectiveRating(p).toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {teams && (
                <div className="flex justify-center mt-8 pb-4">
                  <button
                    onClick={handleShareTeams}
                    className={`w-[300px] border-4 border-t-tertiary p-2 text-lg font-bold transition-all ${isSharing ? 'bg-t-tertiary text-t-background' : 'text-t-tertiary bg-t-background'}`}
                  >
                    SHARE TEAMS
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENT VIEW ── */}
          {view === 'payment' && (
            <div className="border-4 border-t-accent p-6 space-y-6 bg-t-background mb-12">
              <h2 className="text-3xl text-t-accent font-bold text-center">SECURE PAYMENT</h2>
              <div className="border-2 border-t-primary p-4 text-center">
                <p className="text-t-tertiary text-sm mb-1">ITEM: GAFFER 2.0 LICENSE</p>
                <p className="text-t-secondary text-xl font-bold">PRICE: £1.99</p>
              </div>
              <div className="bg-white p-4 rounded-md w-full max-w-sm mx-auto min-h-[150px] flex flex-col justify-center">
                <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "GBP", intent: "capture" }}>
                  <PayPalButtons
                    createOrder={(data, actions) => actions.order.create({ intent: "CAPTURE", purchase_units: [{ description: "GAFFER 2.0 License", amount: { currency_code: "GBP", value: "1.99" } }] })}
                    onApprove={async (data, actions) => { if (actions.order) { await actions.order.capture(); await handlePurchase(); } }}
                    style={{ layout: "vertical", color: "gold", shape: "rect" }}
                  />
                </PayPalScriptProvider>
              </div>
              <button onClick={handlePurchase} className="w-full bg-t-primary text-t-background py-2 text-lg font-bold border-4 border-t-primary transition-all">SIMULATE PAYMENT (DEV TEST)</button>
              <button onClick={() => setView('squad')} className="w-full text-t-secondary text-center underline pt-4">CANCEL</button>
            </div>
          )}

        </div>
      </main>

      <div className="shrink-0 bg-t-background p-4 flex flex-col gap-4">
        <nav className="flex w-full font-bold text-xl gap-4">
          <button onClick={() => setView('squad')} className={`flex-1 py-2 transition-all border-4 border-t-primary ${view === 'squad' ? 'bg-t-primary text-t-background' : 'bg-t-background text-t-primary'}`}>SQUAD</button>
          <button onClick={() => setView('selection')} className={`flex-1 py-2 transition-all border-4 border-t-secondary ${view === 'selection' ? 'bg-t-secondary text-t-background' : 'bg-t-background text-t-secondary'}`}>GAFFER</button>
        </nav>
        <div className="text-center text-xs font-normal text-white bg-t-background normal-case" style={{ fontFamily: 'Courier New, monospace' }}>Copyright - Gary Neill Limited</div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
