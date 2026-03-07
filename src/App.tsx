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
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const cached = localStorage.getItem('ceefax_players_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return GET_RANDOM_16();
  });
  const [view, setView] = useState<'selection' | 'squad' | 'payment' | 'settings'>('squad');
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
  const [kitOpen, setKitOpen] = useState(false);
  const [activeKit, setActiveKit] = useState<typeof KITS[0] | null>(null);
  const [kitsView, setKitsView] = useState(false);
  const [transfersView, setTransfersView] = useState(false);
  const [transferCandidate, setTransferCandidate] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const swipeStartX = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const addRowRef = useRef<HTMLDivElement>(null);
  const translateY = useRef(0);
  const teamsContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const playerCardRefs = useRef<Record<string, HTMLElement | null>>({});

  // ── KIT THEMES — ALL 20 PREMIER LEAGUE CLUBS ──
  const KITS = [
    { name: 'ARSENAL',          bg: '#EF0107', c1: '#ffffff', c2: '#ffffff', c3: '#9C824A', c4: '#9C824A' },
    { name: 'ASTON VILLA',      bg: '#95BFE5', c1: '#ffffff', c2: '#670E36', c3: '#ffd600', c4: '#670E36' },
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
    { name: 'WOLVES',           bg: '#ed8f2f', c1: '#000000', c2: '#231F20', c3: '#FFFFFF', c4: '#231F20' },
  ];

  const applyKit = (kit: typeof KITS[0]) => {
    const root = document.documentElement;
    root.style.setProperty('--color-t-bg', kit.bg);
    root.style.setProperty('--color-t-c1', kit.c1);
    root.style.setProperty('--color-t-c2', kit.c2);
    root.style.setProperty('--color-t-c3', kit.c3);
    root.style.setProperty('--color-t-c4', kit.c4);
    setActiveKit(kit);
    setKitOpen(false);
  };

  // ── SWIPE TO DELETE ──
  const handleSwipeStart = (id: string, x: number) => {
    if (!deleteMode) return;
    setSwipingId(id);
    setSwipeX(0);
    swipeStartX.current = x;
  };
  const handleSwipeMove = (x: number) => {
    if (!swipingId) return;
    const delta = swipeStartX.current - x;
    setSwipeX(Math.max(0, delta));
  };
  const handleSwipeEnd = () => {
    if (!swipingId) return;
    if (swipeX > 80) {
      setPlayers(prev => prev.filter(p => p.id !== swipingId));
    }
    setSwipingId(null);
    setSwipeX(0);
  };

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
    try { localStorage.setItem('ceefax_players_cache', JSON.stringify(players)); } catch {}
    const timer = setTimeout(() => {
      fetch(`/api/players/${squadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(players)
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [players, squadId]);

  // iOS zoom + desktop scrollbar shift: handled via scrollbarGutter stable on main
  // and font-size: 16px on all inputs (prevents iOS auto-zoom)

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
    setTimeout(() => {
      addRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
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
    { key: Position.GKP,     label: 'GKP', textColor: 'text-t-c3', fillColor: 'bg-t-c3' },
    { key: Position.DEFENCE, label: 'DEF', textColor: 'text-t-c1',  fillColor: 'bg-t-c1'  },
    { key: Position.MIDFIELD,label: 'MID', textColor: 'text-t-c3', fillColor: 'bg-t-c3' },
    { key: Position.ATTACK,  label: 'ATT', textColor: 'text-t-c1',  fillColor: 'bg-t-c1'  },
    { key: 'SPD',            label: 'SPD', textColor: 'text-t-c3', fillColor: 'bg-t-c3' },
    { key: 'NRG',            label: 'NRG', textColor: 'text-t-c1',  fillColor: 'bg-t-c1'  },
  ];

  return (
    <ErrorBoundary>
    <style>{`main::-webkit-scrollbar { display: none; }`}</style>
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-t-bg text-t-c1 uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", width: '100%', maxWidth: '1024px', marginLeft: 'auto', marginRight: 'auto' }}>
      <main ref={mainRef} className="flex-grow overflow-y-auto overflow-x-hidden relative" onScroll={handleScroll} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <header ref={headerRef} className="sticky top-0 z-10 bg-t-bg pt-8 pb-4 shrink-0 overflow-x-hidden" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left))', paddingRight: 'max(16px, env(safe-area-inset-right))' }}>
          {/* Title row with ball right-aligned */}
          <div className="mb-[11px] flex items-center justify-between">
            <div className="text-t-c4 font-title font-normal tracking-normal uppercase leading-none" style={{ fontSize: 'clamp(32px, 11vw, 50px)' }}>
              {appMode === 'MM1' ? 'MAN MANAGER' : 'MICRO MANAGER'}
            </div>
            <button
              onClick={() => { setView(v => v === 'settings' ? 'squad' : 'settings'); setKitsView(false); setTransfersView(false); setTransferCandidate(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, alignSelf: 'center', filter: activeKit?.lightBg ? 'invert(1)' : 'none' }}
            >
              <img src="data:image/png;base64,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" width="28" height="28" alt="settings" style={{display:"block"}} />
            </button>
          </div>
          {/* Toggle row — no ball here */}
          <div className="flex justify-between items-center text-sm font-bold border-b-4 border-t-c2 pb-2">
            <div className="flex border-2 border-t-c1 text-base font-bold">
              <button onClick={() => setAppMode('MM1')} className={`px-3 py-1 tracking-[0.2em] ${appMode === 'MM1' ? 'bg-t-c1 text-t-bg' : 'bg-t-bg text-t-c1'}`}>MM1</button>
              <button onClick={() => setAppMode('MM2')} className={`px-3 py-1 border-l-2 border-t-c1 tracking-[0.2em] ${appMode === 'MM2' ? 'bg-t-c1 text-t-bg' : 'bg-t-bg text-t-c1'}`}>MM2</button>
            </div>
            <span className="text-t-c1 text-sm">
              {view === 'selection'
                ? `SELECTED ${players.filter(x => x.isSelected).length}/${players.length}`
                : `PLAYERS: ${players.length}`}
            </span>
          </div>
          {deleteMode && (
            <div className="text-t-c3 text-xs font-bold tracking-widest mt-2 text-center">SWIPE LEFT TO DELETE</div>
          )}
        </header>

        <div className="pb-4 w-full overflow-x-hidden" style={{ paddingTop: '0px', paddingLeft: 'max(16px, env(safe-area-inset-left))', paddingRight: 'max(16px, env(safe-area-inset-right))' }}>

          {/* ── SQUAD VIEW ── */}
          {view === 'squad' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-0">
                {players.map((p) => {
                  const isExpanded = expandedPlayers.has(p.id);
                  const overallRating = appMode === 'MM2'
                    ? (Object.values(p.ratings).reduce((a, b) => a + b, 0) / 6).toFixed(1)
                    : p.ratings[p.position];

                  return (
                    <section
                      key={p.id}
                      ref={el => { playerCardRefs.current[p.id] = el; }}
                      className="border-b border-t-c2 pt-2 pb-3 relative overflow-hidden"
                      onTouchStart={e => handleSwipeStart(p.id, e.touches[0].clientX)}
                      onTouchMove={e => { if (swipingId === p.id) handleSwipeMove(e.touches[0].clientX); }}
                      onTouchEnd={handleSwipeEnd}
                      onMouseDown={e => handleSwipeStart(p.id, e.clientX)}
                      onMouseMove={e => { if (swipingId === p.id && e.buttons === 1) handleSwipeMove(e.clientX); }}
                      onMouseUp={handleSwipeEnd}
                    >
                      {/* Delete reveal zone */}
                      {deleteMode && swipingId === p.id && swipeX > 20 && (
                        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-t-c3 text-t-bg font-bold text-sm px-4" style={{ width: Math.min(swipeX, 120) }}>
                          {swipeX > 80 ? '✕ DELETE' : '✕'}
                        </div>
                      )}
                      <div style={{ transform: deleteMode && swipingId === p.id ? `translateX(-${Math.min(swipeX, 120)}px)` : 'none', transition: swipingId === p.id ? 'none' : 'transform 0.2s' }}>

                      {/* MM1 stars */}
                      {appMode === 'MM1' && (
                        <div className="flex justify-end mb-1">
                          <div className="flex justify-between leading-none" style={{ width: 148, fontSize: '15px' }}>
                            {Array.from({ length: 10 }).map((_, idx) => (
                              <span key={idx} className={idx < p.ratings[p.position] ? 'text-t-c4' : 'text-t-c1/20'}>★</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Name row */}
                      <div className="flex gap-2 items-center">
                        <input
                          value={p.name}
                          inputMode="text"
                          onClick={() => setEditingPlayerId(p.id)}
                          onFocus={() => setEditingPlayerId(p.id)}
                          onBlur={() => setEditingPlayerId(null)}
                          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          onChange={e => setPlayers(players.map(x => x.id === p.id ? { ...x, name: e.target.value.toUpperCase() } : x))}
                          className="border-2 flex-1 bg-t-bg text-t-c1 uppercase outline-none font-bold h-[36px] p-2 cursor-text"
                          style={{
                            fontSize: '16px',
                            letterSpacing: '2px',
                            borderColor: editingPlayerId === p.id ? 'var(--color-t-c4)' : 'var(--color-t-c2)',
                            WebkitUserSelect: 'text',
                          }}
                        />

                        {/* MM1: position toggle */}
                        {appMode === 'MM1' && (
                          <div className="flex border-2 border-t-c1 overflow-hidden flex-shrink-0" style={{ height: 36 }}>
                            {([Position.GKP, Position.DEFENCE, Position.MIDFIELD, Position.ATTACK] as Position[]).map((pos, i, arr) => (
                              <button
                                key={pos}
                                onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: pos } : x))}
                                style={{ width: 32, height: 36, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                className={`text-[14px] md:text-[12px] font-bold tracking-wide flex-shrink-0 ${i < arr.length - 1 ? 'border-r-2 border-t-c1' : ''} ${p.position === pos
                                  ? 'bg-t-c1 text-t-bg'
                                  : 'bg-t-bg text-t-c1/75'}`}
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
                            className="flex items-center justify-between border-2 border-t-c1 px-3 h-[36px] flex-shrink-0"
                            style={{ width: 88 }}
                          >
                            <span className="text-t-c4 font-bold text-sm">{overallRating}</span>
                            <span className="text-t-c1/50 text-xs">{isExpanded ? '▲' : '▼'}</span>
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
                            style={{ fontSize: '16px' }}
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
                      </div>{/* end swipe wrapper */}
                      </section>
                  );
                })}
              </div>

              {/* NAME / ADD — sits below last player, scrolls with list */}
              <div ref={addRowRef} className="flex gap-2 pt-2 pb-4">
                <input
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value.toUpperCase())}
                  placeholder="NAME . . ."
                  onKeyDown={e => e.key === 'Enter' && addPlayer()}
                  className="flex-1 bg-t-bg border-2 border-t-c2 text-t-c1 placeholder-t-c1/30 uppercase outline-none px-2 font-bold"
                  style={{ height: 36, fontSize: '16px', letterSpacing: '2px' }}
                />
                <button
                  onClick={addPlayer}
                  className="flex-shrink-0 bg-t-bg border-2 border-t-c3 text-t-c3 font-bold tracking-widest text-lg active:bg-t-c3 active:text-t-bg transition-colors"
                  style={{ width: 88, height: 36 }}
                >ADD</button>
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
                    className={`p-2 border-2 text-left text-sm transition-all font-bold ${p.isSelected ? 'bg-t-c4 text-t-bg border-t-c4' : 'bg-t-bg text-t-c1 border-t-c1/20'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={balanceTeams}
                  className={`w-[300px] border-4 border-t-c4 p-2 text-lg font-bold transition-all ${isGenerating ? 'bg-t-c4 text-t-bg' : 'text-t-c4 bg-t-bg'}`}
                >
                  GENERATE TEAMS
                </button>
              </div>
              {teams && (
                <div ref={teamsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {[
                    { data: teams.team1, color: 'text-t-c1', border: 'border-t-c1', ratingColor: 'text-t-c1' },
                    { data: teams.team2, color: 'text-t-c4', border: 'border-t-c4', ratingColor: 'text-t-c4' }
                  ].map(t => (
                    <div key={t.data.name} className={`border-4 ${t.border} p-4`}>
                      <div className={`flex items-end border-b-2 ${t.border} mb-4 pb-2`}>
                        <h3 className={`flex-1 text-2xl font-bold truncate pr-2 ${t.color}`}>{t.data.name}</h3>
                        {showPlayerDetails && (
                          <>
                            <span className={`w-12 md:w-16 text-base md:text-xl font-bold ${t.color}`}>RTG</span>
                            <span className={`w-8 md:w-10 text-base md:text-xl font-bold ${t.ratingColor}`}>{t.data.totalRating % 1 === 0 ? t.data.totalRating : t.data.totalRating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                      {t.data.players.map(p => (
                        <div key={p.id} className={`flex text-base md:text-xl ${t.color}`}>
                          <span className="flex-1 truncate pr-2">{p.name}</span>
                          {showPlayerDetails && (
                            <>
                              <span className={`w-12 md:w-16 ${t.color}`}>{getEffectivePosition(p).substring(0, 3)}</span>
                              <span className={`w-8 md:w-10 ${t.ratingColor}`}>{getEffectiveRating(p) % 1 === 0 ? getEffectiveRating(p) : getEffectiveRating(p).toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {teams && (
                <div className="flex justify-center mt-8">
                  <div className="flex w-[300px] border-4 border-t-c1 text-lg font-bold">
                    <button onClick={() => setShowPlayerDetails(false)} className={`flex-1 p-2 transition-all ${!showPlayerDetails ? 'bg-t-c1 text-t-bg' : 'bg-t-bg text-t-c1'}`}>HIDE INFO</button>
                    <button onClick={() => setShowPlayerDetails(true)} className={`flex-1 p-2 transition-all ${showPlayerDetails ? 'bg-t-c1 text-t-bg' : 'bg-t-bg text-t-c1'}`}>SHOW INFO</button>
                  </div>
                </div>
              )}
              {teams && (
                <div className="flex justify-center mt-4 pb-4">
                  <button
                    onClick={handleShareTeams}
                    className={`w-[300px] border-4 border-t-c4 p-2 text-lg font-bold transition-all ${isSharing ? 'bg-t-c4 text-t-bg' : 'text-t-c4 bg-t-bg'}`}
                  >
                    SHARE TEAMS
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENT VIEW ── */}
          {view === 'payment' && (
            <div className="border-4 border-t-c4 p-6 space-y-6 bg-t-bg mb-12">
              <h2 className="text-3xl text-t-c4 font-bold text-center">SECURE PAYMENT</h2>
              <div className="border-2 border-t-c2 p-4 text-center">
                <p className="text-t-c1 text-sm mb-1">ITEM: GAFFER 2.0 LICENSE</p>
                <p className="text-t-c3 text-xl font-bold">PRICE: £1.99</p>
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
              <button onClick={handlePurchase} className="w-full bg-t-c2 text-t-bg py-2 text-lg font-bold border-4 border-t-c2 transition-all">SIMULATE PAYMENT (DEV TEST)</button>
              <button onClick={() => setView('squad')} className="w-full text-t-c3 text-center underline pt-4">CANCEL</button>
            </div>
          )}

          {/* ── SETTINGS VIEW ── */}
          {view === 'settings' && !kitsView && !transfersView && (
            <div className="flex flex-col items-center gap-4 py-16">
              <button
                onClick={() => setKitsView(true)}
                className="border-4 border-t-c1 py-2 text-xl font-bold bg-t-bg text-t-c1"
                style={{ width: 'calc(50% - 8px)' }}
              >KITS</button>
              <button
                onClick={() => setTransfersView(true)}
                className="border-4 border-t-c1 py-2 text-xl font-bold bg-t-bg text-t-c1"
                style={{ width: 'calc(50% - 8px)' }}
              >TRANSFERS</button>
              <button
                className="border-4 border-t-c1 py-2 text-xl font-bold bg-t-bg text-t-c1"
                style={{ width: 'calc(50% - 8px)' }}
              >T&amp;C'S</button>
            </div>
          )}

          {/* ── KITS VIEW ── */}
          {view === 'settings' && kitsView && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {KITS.map(kit => (
                  <button
                    key={kit.name}
                    onClick={() => { applyKit(kit); setKitsView(false); setView('squad'); }}
                    className="p-2 border-2 text-left text-sm font-bold border-t-c1 bg-t-bg text-t-c1"
                  >
                    {kit.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TRANSFERS VIEW ── */}
          {view === 'settings' && transfersView && (
            <div className="space-y-2">

              {/* Player grid with overlay when candidate selected */}
              <div className="relative">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {players.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setTransferCandidate(p.id)}
                      className={`p-2 border-2 text-left text-sm font-bold transition-all ${
                        transferCandidate === p.id
                          ? 'bg-t-c4 text-t-bg border-t-c4'
                          : 'bg-t-bg text-t-c1 border-t-c1/40'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* 80% tint overlay when a player is selected */}
                {transferCandidate && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-t-bg) 80%, transparent)' }}
                  />
                )}
              </div>

              {/* KEEP / SELL — fixed, centred vertically and horizontally */}
              {transferCandidate && (() => {
                const p = players.find(x => x.id === transferCandidate);
                return p ? (
                  <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none" style={{ zIndex: 50 }}>
                    <div className="text-t-c4 font-bold text-center text-xl tracking-widest">{p.name}</div>
                    <button
                      onClick={() => setTransferCandidate(null)}
                      className="border-4 border-t-c2 py-2 text-xl font-bold bg-t-bg text-t-c2 pointer-events-auto"
                      style={{ width: 'calc(50% - 8px)' }}
                    >KEEP</button>
                    <button
                      onClick={() => {
                        setPlayers(players.filter(x => x.id !== transferCandidate));
                        setTransferCandidate(null);
                      }}
                      className="border-4 border-t-c4 py-2 text-xl font-bold bg-t-c4 text-t-bg pointer-events-auto"
                      style={{ width: 'calc(50% - 8px)' }}
                    >SELL</button>
                  </div>
                ) : null;
              })()}
            </div>
          )}

        </div>
      </main>

      {view !== 'settings' && (
      <div className="shrink-0 bg-t-bg pt-4 pb-4 flex flex-col gap-4" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left))', paddingRight: 'max(16px, env(safe-area-inset-right))' }}>
        <nav className="flex w-full font-bold text-xl gap-4">
          <button onClick={() => setView('squad')} className={`flex-1 py-2 transition-all border-4 border-t-c2 ${view === 'squad' ? 'bg-t-c2 text-t-bg' : 'bg-t-bg text-t-c2'}`}>SQUAD</button>
          <button onClick={() => setView('selection')} className={`flex-1 py-2 transition-all border-4 border-t-c3 ${view === 'selection' ? 'bg-t-c3 text-t-bg' : 'bg-t-bg text-t-c3'}`}>GAFFER</button>
        </nav>
        <div className="text-center text-xs font-normal text-t-c1 bg-t-bg normal-case" style={{ fontFamily: 'Courier New, monospace' }}>Copyright - Gary Neill Limited</div>
      </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
