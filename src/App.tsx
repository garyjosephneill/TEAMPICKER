import React, { useState, useEffect, useRef } from 'react';


// ── ERROR BOUNDARY ──────────────────────────────────────────────────────────
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

// ── TYPES ───────────────────────────────────────────────────────────────────
enum Position { GKP = 'GKP', DEFENCE = 'DEFENCE', MIDFIELD = 'MIDFIELD', ATTACK = 'ATTACK' }
type StatKey = Position | 'NRG' | 'SPD';
interface Player { id: string; name: string; ratings: Record<StatKey, number>; position: Position; isSelected: boolean; }
interface Team { name: string; players: Player[]; totalRating: number; positions: Record<Position, number>; }

// ── CONSTANTS ───────────────────────────────────────────────────────────────
const DEFAULT_RATINGS = (): Record<StatKey, number> => ({
  [Position.GKP]: 5, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5, NRG: 5, SPD: 5
});

const RANDOM_MM2_RATINGS = (): Record<StatKey, number> => {
  const r = () => Math.floor(Math.random() * 7) + 4;
  return { [Position.GKP]: r(), [Position.DEFENCE]: r(), [Position.MIDFIELD]: r(), [Position.ATTACK]: r(), NRG: r(), SPD: r() };
};

const TEAM_NAMES = [
  'UNITED', 'CITY', 'TOWN', 'ROVERS', 'ATHLETIC', 'WANDERERS',
  'RANGERS', 'COUNTY', 'ALBION', 'VILLA', 'ALEXANDRA', 'ORIENT',
  'BOROUGH', 'ACADEMICAL', 'FOREST', 'WEDNESDAY', 'PARK', 'VALE'
];

const FAMOUS_PLAYERS = [
  { name: 'THE CAT',     ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 6, SPD: 5 }, position: Position.GKP },
  { name: 'SIMMO',       ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 7, SPD: 6 }, position: Position.GKP },
  { name: 'CHOPPER',     ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 9, SPD: 5 }, position: Position.DEFENCE },
  { name: 'BIG JOHN',    ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 7, SPD: 4 }, position: Position.DEFENCE },
  { name: 'FRANCO',      ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 8, SPD: 7 }, position: Position.DEFENCE },
  { name: 'BARRY',       ratings: { GKP: 5, DEFENCE: 5, MIDFIELD: 5, ATTACK: 5, NRG: 6, SPD: 5 }, position: Position.DEFENCE },
  { name: 'BONES',       ratings: { GKP: 5, DEFENCE: 5, MIDFIELD: 5, ATTACK: 5, NRG: 7, SPD: 6 }, position: Position.DEFENCE },
  { name: 'LUNGS',       ratings: { GKP: 8, DEFENCE: 8, MIDFIELD: 8, ATTACK: 8, NRG: 10, SPD: 8 }, position: Position.MIDFIELD },
  { name: 'TRICKY PETE', ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 7, SPD: 9 }, position: Position.MIDFIELD },
  { name: 'WOR DAVE',    ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 8, SPD: 7 }, position: Position.MIDFIELD },
  { name: 'GADGET',      ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 8, SPD: 8 }, position: Position.MIDFIELD },
  { name: 'SWEATY',      ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 9, SPD: 6 }, position: Position.MIDFIELD },
  { name: 'BOBBY SCORE', ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 8, SPD: 9 }, position: Position.ATTACK },
  { name: 'GAZADONNA',   ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 7, SPD: 10 }, position: Position.ATTACK },
  { name: 'THE POSTMAN', ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 6, SPD: 7 }, position: Position.ATTACK },
  { name: 'SNIFFER',     ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 7, SPD: 8 }, position: Position.ATTACK },
  { name: 'LITTLE JOHN', ratings: { GKP: 6, DEFENCE: 6, MIDFIELD: 6, ATTACK: 6, NRG: 6, SPD: 6 }, position: Position.ATTACK },
  { name: 'GAV',         ratings: { GKP: 7, DEFENCE: 7, MIDFIELD: 7, ATTACK: 7, NRG: 7, SPD: 8 }, position: Position.ATTACK },
];

const GET_RANDOM_16 = (): Player[] => {
  const shuffled = [...FAMOUS_PLAYERS].sort(() => 0.5 - Math.random());
  const defenders = shuffled.filter(p => p.position === Position.DEFENCE).slice(0, 2);
  const midfielders = shuffled.filter(p => p.position === Position.MIDFIELD).slice(0, 2);
  const remaining = shuffled.filter(p => !defenders.includes(p) && !midfielders.includes(p));
  const selected16 = [...defenders, ...midfielders, ...remaining.slice(0, 12)].sort(() => 0.5 - Math.random());
  const selectedIds = new Set(selected16.sort(() => 0.5 - Math.random()).slice(0, 10).map(p => p.name));
  return selected16.map(p => ({ ...p, id: crypto.randomUUID(), isSelected: selectedIds.has(p.name), ratings: RANDOM_MM2_RATINGS() }));
};

const SPLASH_KITS_DATA = [
  { bg: '#7ab4e3', c4: '#670E36' }, { bg: '#DA291C', c4: '#000000' },
  { bg: '#0057B8', c4: '#ffcd00' }, { bg: '#1B458F', c4: '#C4122E' },
  { bg: '#ffffff', c4: '#ce0007' }, { bg: '#b20622', c4: '#fced5e' },
  { bg: '#6CABDD', c4: '#1C2C5B' }, { bg: '#030000', c4: '#41B0E4' },
  { bg: '#DD0000', c4: '#000000' }, { bg: '#132257', c4: '#ffffff' },
  { bg: '#7A263A', c4: '#F3D459' }, { bg: '#e27c2f', c4: '#231F20' },
];

const KITS = [
  { name: 'ARSENAL',        bg: '#EF0107', c1: '#ffffff', c2: '#ffffff', c3: '#9C824A', c4: '#9C824A' },
  { name: 'ASTON VILLA',    bg: '#7ab4e3', c1: '#ffffff', c2: '#670E36', c3: '#ffd600', c4: '#670E36' },
  { name: 'BOURNEMOUTH',    bg: '#DA291C', c1: '#ffffff', c2: '#000000', c3: '#000000', c4: '#000000' },
  { name: 'BRENTFORD',      bg: '#e30613', c1: '#ffffff', c2: '#ffffff', c3: '#000000', c4: '#000000' },
  { name: 'BRIGHTON',       bg: '#0057B8', c1: '#ffffff', c2: '#ffffff', c3: '#ffcd00', c4: '#ffcd00' },
  { name: 'CHELSEA',        bg: '#034694', c1: '#ffffff', c2: '#ffffff', c3: '#DBA111', c4: '#DBA111' },
  { name: 'CRYSTAL PALACE', bg: '#1B458F', c1: '#ffffff', c2: '#d4d1d2', c3: '#d2d2d2', c4: '#C4122E' },
  { name: 'EVERTON',        bg: '#003399', c1: '#ffffff', c2: '#ffffff', c3: '#ffdf1c', c4: '#ffdf1c' },
  { name: 'FULHAM',         bg: '#ffffff', c1: '#000000', c2: '#ce0007', c3: '#CC0000', c4: '#ce0007', lightBg: true },
  { name: 'IPSWICH',        bg: '#0044A9', c1: '#ffffff', c2: '#ffffff', c3: '#de2d26', c4: '#de2d26' },
  { name: 'LEICESTER',      bg: '#003090', c1: '#ffffff', c2: '#FDBE11', c3: '#FDBE11', c4: '#FDBE11' },
  { name: 'LIVERPOOL',      bg: '#b20622', c1: '#ffffff', c2: '#0bc9b0', c3: '#F6EB61', c4: '#fced5e' },
  { name: 'MAN CITY',       bg: '#6CABDD', c1: '#ffffff', c2: '#1C2C5B', c3: '#1C2C5B', c4: '#1C2C5B' },
  { name: 'MAN UTD',        bg: '#DA291C', c1: '#000000', c2: '#ffffff', c3: '#ffffff', c4: '#FBE122' },
  { name: 'NEWCASTLE',      bg: '#030000', c1: '#ffffff', c2: '#ffffff', c3: '#41B0E4', c4: '#41B0E4' },
  { name: "NOTT'M FOREST",  bg: '#DD0000', c1: '#ffffff', c2: '#030000', c3: '#000000', c4: '#000000' },
  { name: 'SOUTHAMPTON',    bg: '#D71920', c1: '#ffffff', c2: '#ffffff', c3: '#FFC20E', c4: '#FFC20E' },
  { name: 'SPURS',          bg: '#132257', c1: '#ffffff', c2: '#bcbec0', c3: '#BCBEC0', c4: '#ffffff' },
  { name: 'WEST HAM',       bg: '#7A263A', c1: '#ffffff', c2: '#1BB1E7', c3: '#1BB1E7', c4: '#F3D459' },
  { name: 'WOLVES',         bg: '#e27c2f', c1: '#000000', c2: '#ffffff', c3: '#FFFFFF', c4: '#231F20' },
];

const INTL_KITS = [
  { name: 'ARGENTINA',   bg: '#74ACDF', c1: '#ffffff', c2: '#ffffff', c3: '#F6B40E', c4: '#F6B40E' },
  { name: 'AUSTRALIA',   bg: '#00843D', c1: '#ffffff', c2: '#FFD700', c3: '#FFD700', c4: '#FFD700' },
  { name: 'BELGIUM',     bg: '#000000', c1: '#ffffff', c2: '#FFD700', c3: '#EF3340', c4: '#FFD700' },
  { name: 'BRAZIL',      bg: '#009C3B', c1: '#ffffff', c2: '#FFDF00', c3: '#002776', c4: '#FFDF00' },
  { name: 'CROATIA',     bg: '#FF0000', c1: '#ffffff', c2: '#003DA5', c3: '#003DA5', c4: '#003DA5' },
  { name: 'ENGLAND',     bg: '#CE1124', c1: '#ffffff', c2: '#ffffff', c3: '#00247D', c4: '#00247D' },
  { name: 'FRANCE',      bg: '#002395', c1: '#ffffff', c2: '#ED2939', c3: '#ED2939', c4: '#ED2939' },
  { name: 'GERMANY',     bg: '#ffffff', c1: '#000000', c2: '#D00000', c3: '#FFCE00', c4: '#D00000', lightBg: true },
  { name: 'ITALY',       bg: '#003DA5', c1: '#ffffff', c2: '#CE2B37', c3: '#ffffff', c4: '#CE2B37' },
  { name: 'IVORY COAST', bg: '#F77F00', c1: '#ffffff', c2: '#009A44', c3: '#ffffff', c4: '#009A44' },
  { name: 'JAPAN',       bg: '#003DA5', c1: '#ffffff', c2: '#BC002D', c3: '#ffffff', c4: '#BC002D' },
  { name: 'MEXICO',      bg: '#006847', c1: '#ffffff', c2: '#CE1126', c3: '#ffffff', c4: '#CE1126' },
  { name: 'MOROCCO',     bg: '#C1272D', c1: '#ffffff', c2: '#006233', c3: '#ffffff', c4: '#006233' },
  { name: 'NETHERLANDS', bg: '#FF4F00', c1: '#ffffff', c2: '#003DA5', c3: '#ffffff', c4: '#003DA5' },
  { name: 'PORTUGAL',    bg: '#006600', c1: '#ffffff', c2: '#FF0000', c3: '#FFD700', c4: '#FF0000' },
  { name: 'SCOTLAND',    bg: '#003DA5', c1: '#ffffff', c2: '#FFD700', c3: '#ffffff', c4: '#FFD700' },
  { name: 'SENEGAL',     bg: '#00853F', c1: '#ffffff', c2: '#FDEF42', c3: '#E31B23', c4: '#FDEF42' },
  { name: 'SPAIN',       bg: '#AA151B', c1: '#ffffff', c2: '#F1BF00', c3: '#F1BF00', c4: '#F1BF00' },
  { name: 'TURKEY',      bg: '#E30A17', c1: '#ffffff', c2: '#ffffff', c3: '#ffffff', c4: '#ffffff' },
  { name: 'URUGUAY',     bg: '#5EB6E4', c1: '#ffffff', c2: '#000000', c3: '#ffffff', c4: '#000000' },
  { name: 'WALES',       bg: '#C8102E', c1: '#ffffff', c2: '#FFD700', c3: '#004B87', c4: '#FFD700' },
];

const MM2_STATS: { key: StatKey; label: string; textColor: string; fillColor: string }[] = [
  { key: Position.GKP,      label: 'GKP', textColor: 'text-t-c3', fillColor: 't-c3' },
  { key: Position.DEFENCE,  label: 'DEF', textColor: 'text-t-c1', fillColor: 't-c1' },
  { key: Position.MIDFIELD, label: 'MID', textColor: 'text-t-c3', fillColor: 't-c3' },
  { key: Position.ATTACK,   label: 'ATT', textColor: 'text-t-c1', fillColor: 't-c1' },
  { key: 'SPD',             label: 'SPD', textColor: 'text-t-c3', fillColor: 't-c3' },
  { key: 'NRG',             label: 'NRG', textColor: 'text-t-c1', fillColor: 't-c1' },
];

// ── TAPZONE ─────────────────────────────────────────────────────────────────
function TapZone({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = React.useState(24);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.getBoundingClientRect().width;
      setCellSize(Math.floor((w - 9 * 3) / 10));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ display: 'flex', gap: '3px', width: '100%' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          onClick={() => onChange(i + 1)}
          style={{
            width: cellSize, height: cellSize,
            flexShrink: 0, flexGrow: 0,
            cursor: 'pointer',
            backgroundColor: i < value ? `var(--color-${color})` : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const cached = localStorage.getItem('ceefax_players_cache');
      return cached ? JSON.parse(cached) : GET_RANDOM_16();
    } catch { return GET_RANDOM_16(); }
  });
  const [view, setView] = useState<'squad' | 'selection' | 'settings'>('squad');
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
  const [splashKits] = useState(() => [...SPLASH_KITS_DATA].sort(() => Math.random() - 0.5));
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showPlayerDetails, setShowPlayerDetails] = useState(true);
  const [activeKit, setActiveKit] = useState<typeof KITS[0] | null>(null);
  const [kitsView, setKitsView] = useState(false);
  const [kitLeague, setKitLeague] = useState<'PL' | 'INTL'>('PL');
  const [transfersView, setTransfersView] = useState(false);
  const [transferCandidate, setTransferCandidate] = useState<string | null>(null);
  const [placeholderText, setPlaceholderText] = useState('');

  const headerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const addRowRef = useRef<HTMLDivElement>(null);
  const teamsContainerRef = useRef<HTMLDivElement>(null);
  const playerCardRefs = useRef<Record<string, HTMLElement | null>>({});

  // ── Animated placeholder ──
  const PLACEHOLDER_FULL = 'ADD YOUR PLAYER . . .';
  useEffect(() => {
    let charIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const typeNext = () => {
      charIndex++;
      setPlaceholderText(PLACEHOLDER_FULL.slice(0, charIndex));
      if (charIndex < PLACEHOLDER_FULL.length) {
        timeout = setTimeout(typeNext, 2000 / PLACEHOLDER_FULL.length);
      } else {
        timeout = setTimeout(() => {
          setPlaceholderText('');
          timeout = setTimeout(() => { charIndex = 0; typeNext(); }, 1000);
        }, 2000);
      }
    };
    timeout = setTimeout(typeNext, 2000 / PLACEHOLDER_FULL.length);
    return () => clearTimeout(timeout);
  }, []);

  // ── Kit init + splash ──
  useEffect(() => {
    const KIT_VERSION = 'v2';
    if (localStorage.getItem('lazy_gaffer_kit_version') !== KIT_VERSION) {
      localStorage.removeItem('lazy_gaffer_kit');
      localStorage.setItem('lazy_gaffer_kit_version', KIT_VERSION);
    }
    const saved = localStorage.getItem('lazy_gaffer_kit');
    const allKits = [...KITS, ...INTL_KITS];
    const appKit = saved ? JSON.parse(saved) : allKits[Math.floor(Math.random() * allKits.length)];
    setActiveKit(appKit);
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    const applyBg = (bg: string) => {
      root.style.setProperty('--color-t-bg', bg);
      document.body.style.setProperty('background-color', bg, 'important');
      if (meta) meta.content = bg;
    };
    applyBg(splashKits[0].bg);
    let i = 1;
    const interval = setInterval(() => {
      if (i < splashKits.length) {
        applyBg(splashKits[i].bg);
        setSplashKit(i);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          root.style.setProperty('--color-t-bg', appKit.bg);
          root.style.setProperty('--color-t-c1', appKit.c1);
          root.style.setProperty('--color-t-c2', appKit.c2);
          root.style.setProperty('--color-t-c3', appKit.c3);
          root.style.setProperty('--color-t-c4', appKit.c4);
          document.body.style.removeProperty('background-color');
          if (meta) meta.content = appKit.bg;
          setSplashDone(true);
        }, 200);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // ── Scroll to top on view change ──
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // ── Fetch players from server ──
  useEffect(() => {
    fetch(`/api/players/${squadId}`).then(r => r.json()).then(data => {
      if (data.length > 0) {
        setPlayers(data.map((p: any) => {
          const r = typeof p.ratings === 'string' ? JSON.parse(p.ratings) : p.ratings;
          const merged = { ...DEFAULT_RATINGS(), ...r };
          const isFlat = merged[Position.GKP] === merged[Position.DEFENCE] &&
                         merged[Position.DEFENCE] === merged[Position.MIDFIELD] &&
                         merged[Position.MIDFIELD] === merged[Position.ATTACK];
          return { ...p, ratings: isFlat ? RANDOM_MM2_RATINGS() : merged };
        }));
      }
    }).catch(() => {});
  }, [squadId]);

  // ── Persist players ──
  useEffect(() => {
    if (players.length === 0) return;
    try { localStorage.setItem('ceefax_players_cache', JSON.stringify(players)); } catch {}
    const timer = setTimeout(() => {
      fetch(`/api/players/${squadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(players)
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [players, squadId]);

  // ── Helpers ──
  const getEffectivePosition = (p: Player): Position => {
    const priority = [Position.ATTACK, Position.MIDFIELD, Position.DEFENCE, Position.GKP];
    return priority.reduce((best, cur) => p.ratings[cur] > p.ratings[best] ? cur : best, Position.ATTACK);
  };

  const getEffectiveRating = (p: Player): number => {
    const { GKP, DEFENCE, MIDFIELD, ATTACK, NRG, SPD } = p.ratings;
    return (GKP + DEFENCE + MIDFIELD + ATTACK + NRG + SPD) / 6;
  };

  const scrollTo = (top: number) => {
    scrollRef.current?.scrollTo({ top, behavior: 'smooth' });
  };

  const scrollToEl = (el: HTMLElement) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const elTop = el.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
    scrollEl.scrollTo({ top: elTop, behavior: 'smooth' });
  };

  // ── Actions ──
  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const pos = [Position.DEFENCE, Position.MIDFIELD, Position.ATTACK][Math.floor(Math.random() * 3)];
    setPlayers(prev => [{
      id: crypto.randomUUID(), name: newPlayerName.trim(),
      ratings: RANDOM_MM2_RATINGS(), position: pos, isSelected: true
    }, ...prev]);
    setNewPlayerName('');
    setTimeout(() => { if (addRowRef.current) scrollTo(0); }, 50);
  };

  const updateStat = (playerId: string, stat: StatKey, value: number) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ratings: { ...p.ratings, [stat]: value } } : p));
  };

  const toggleExpanded = (id: string) => {
    setExpandedPlayers(prev => {
      const next = new Set(prev);
      const isOpening = !next.has(id);
      isOpening ? next.add(id) : next.delete(id);
      if (isOpening) {
        setTimeout(() => {
          const card = playerCardRefs.current[id];
          if (card) scrollToEl(card);
        }, 100);
      }
      return next;
    });
  };

  const applyKit = (kit: typeof KITS[0]) => {
    const root = document.documentElement;
    root.style.setProperty('--color-t-bg', kit.bg);
    root.style.setProperty('--color-t-c1', kit.c1);
    root.style.setProperty('--color-t-c2', kit.c2);
    root.style.setProperty('--color-t-c3', kit.c3);
    root.style.setProperty('--color-t-c4', kit.c4);
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (meta) meta.content = kit.bg;
    localStorage.setItem('lazy_gaffer_kit', JSON.stringify(kit));
    setActiveKit(kit);
  };

  const balanceTeams = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1000);
    const selected = players.filter(p => p.isSelected);
    if (selected.length < 2) return;
    const t1: Player[] = [], t2: Player[] = [], leftovers: Player[] = [];
    const positions = [Position.GKP, Position.DEFENCE, Position.MIDFIELD, Position.ATTACK];
    positions.forEach(pos => {
      const posPlayers = selected.filter(p => getEffectivePosition(p) === pos)
        .sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a));
      for (let i = 0; i < posPlayers.length; i += 2) {
        const p1 = posPlayers[i], p2 = posPlayers[i + 1];
        if (p2) {
          const t1R = t1.reduce((s, p) => s + getEffectiveRating(p), 0);
          const t2R = t2.reduce((s, p) => s + getEffectiveRating(p), 0);
          if (t1.length < t2.length)       { t1.push(p1); t2.push(p2); }
          else if (t2.length < t1.length)  { t2.push(p1); t1.push(p2); }
          else if (t1R < t2R)              { t1.push(p1); t2.push(p2); }
          else if (t2R < t1R)              { t2.push(p1); t1.push(p2); }
          else if (Math.random() > 0.5)    { t1.push(p1); t2.push(p2); }
          else                             { t1.push(p2); t2.push(p1); }
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
      sortOrder[getEffectivePosition(a)] - sortOrder[getEffectivePosition(b)] ||
      getEffectiveRating(b) - getEffectiveRating(a)
    );
    const shuffledNames = [...TEAM_NAMES].sort(() => 0.5 - Math.random());
    const createTeam = (name: string, ps: Player[]): Team => ({
      name, players: sortPlayers(ps),
      totalRating: ps.reduce((s, p) => s + getEffectiveRating(p), 0),
      positions: {
        [Position.GKP]:      ps.filter(x => getEffectivePosition(x) === Position.GKP).length,
        [Position.DEFENCE]:  ps.filter(x => getEffectivePosition(x) === Position.DEFENCE).length,
        [Position.MIDFIELD]: ps.filter(x => getEffectivePosition(x) === Position.MIDFIELD).length,
        [Position.ATTACK]:   ps.filter(x => getEffectivePosition(x) === Position.ATTACK).length,
      }
    });
    setTeams({ team1: createTeam(shuffledNames[0], t1), team2: createTeam(shuffledNames[1], t2) });
    setTimeout(() => { if (teamsContainerRef.current) scrollToEl(teamsContainerRef.current); }, 100);
  };

  const handleShareTeams = () => {
    if (!teams) return;
    setIsSharing(true);
    setTimeout(() => setIsSharing(false), 1000);
    const fmt = (n: number) => n % 1 === 0 ? String(n) : n.toFixed(1);
    const formatTeam = (team: Team) => {
      let text = `${team.name}\n------------------------\n`;
      team.players.forEach(p => {
        if (showPlayerDetails) {
          text += `${p.name} - ${getEffectivePosition(p).substring(0, 3)} - ${fmt(getEffectiveRating(p))}\n`;
        } else {
          text += `${p.name}\n`;
        }
      });
      if (showPlayerDetails) text += `------------------------\nTOTAL RTG: ${fmt(team.totalRating)}\n`;
      return text;
    };
    const body = `${formatTeam(teams.team1)}\n\n${formatTeam(teams.team2)}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(`Teams for ${new Date().toLocaleDateString()}`)}&body=${encodeURIComponent(body)}`;
  };

  const resetSquad = () => {
    const newId = Math.floor(100 + Math.random() * 900).toString();
    localStorage.setItem('ceefax_squad_id', newId);
    window.location.reload();
  };

  // ── Splash screen ──
  if (!splashDone) {
    const kit = splashKits[splashKit] || splashKits[0];
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: kit.bg, fontFamily: "'Bebas Neue', sans-serif" }}>
        <span style={{ fontSize: 'clamp(52px, 14vw, 96px)', letterSpacing: '0.05em', color: kit.c4, whiteSpace: 'nowrap' }}>
          LAZY GAFFER
        </span>
      </div>
    );
  }

  // ── Render ──
  return (
    <ErrorBoundary>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        input[type=range]::-webkit-slider-thumb { background: ${activeKit?.lightBg ? '#000000' : 'var(--color-t-c1)'}; }
        input[type=range]::-moz-range-thumb { background: ${activeKit?.lightBg ? '#000000' : 'var(--color-t-c1)'}; border: none; }
      `}</style>
      <style>{`.lazy-placeholder::placeholder { color: var(--color-t-c1); opacity: 0.5; }`}</style>

      {/* ── Outer shell: position fixed, no overflow hidden ── */}
      <div
        className="bg-t-bg text-t-c1 uppercase"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
        }}
      >
        {/* ── Inner column: max 1024px ── */}
        <div style={{ width: '100%', maxWidth: 1024, display: 'flex', flexDirection: 'column' }}>

          {/* ── Header ── */}
          <header
            ref={headerRef}
            className="bg-t-bg shrink-0"
            style={{
              paddingTop: 'max(20px, env(safe-area-inset-top))',
              paddingLeft: 'max(16px, env(safe-area-inset-left))',
              paddingRight: 'max(16px, env(safe-area-inset-right))',
              paddingBottom: 16,
            }}
          >
            <div className="flex items-end justify-between" style={{ marginBottom: 4 }}>
              <div className="text-t-c4 font-title font-normal leading-none" style={{ fontSize: 60 }}>
                LAZY GAFFER
              </div>
              <div>
                <button
                  onClick={() => { setView(v => v === 'settings' ? 'squad' : 'settings'); setKitsView(false); setTransfersView(false); setTransferCandidate(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-t-c4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="border-b-4 border-t-c2" />
          </header>

          {/* ── Scroll area ── */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'scroll',
              WebkitOverflowScrolling: 'touch' as any,
            }}
          >
            <div
              style={{
                paddingLeft: 'max(16px, env(safe-area-inset-left))',
                paddingRight: 'max(16px, env(safe-area-inset-right))',
                paddingTop: 0,
                paddingBottom: 140,
              }}
            >

              {/* ── SQUAD VIEW ── */}
              {view === 'squad' && (
                <div>
                  <div ref={addRowRef} className="flex gap-2 pt-2 pb-4">
                    <input
                      value={newPlayerName}
                      onChange={e => setNewPlayerName(e.target.value.toUpperCase())}
                      placeholder={newPlayerName ? '' : placeholderText}
                      onKeyDown={e => e.key === 'Enter' && addPlayer()}
                      className="flex-1 bg-t-bg border-2 border-t-c2 text-t-c1 uppercase outline-none px-2 font-bold lazy-placeholder"
                      style={{ height: 36, fontSize: 16, letterSpacing: 2 }}
                    />
                    <button
                      onClick={addPlayer}
                      className="shrink-0 bg-t-bg border-2 border-t-c3 text-t-c3 font-bold tracking-widest text-lg active:bg-t-c3 active:text-t-bg transition-colors"
                      style={{ width: 88, height: 36 }}
                    >ADD</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '0 2rem' }}>
                    {players.map(p => {
                      const isExpanded = expandedPlayers.has(p.id);
                      const overall = (Object.values(p.ratings).reduce((a, b) => a + b, 0) / 6).toFixed(1);
                      return (
                        <section
                          key={p.id}
                          className="border-b border-t-c2 pt-2 pb-3"
                        >
                          {/* Name row */}
                          <div ref={el => { playerCardRefs.current[p.id] = el; }} className="flex gap-2 items-center">
                            <input
                              value={p.name}
                              inputMode="text"
                              onFocus={() => setEditingPlayerId(p.id)}
                              onBlur={() => setEditingPlayerId(null)}
                              onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                              onChange={e => setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, name: e.target.value.toUpperCase() } : x))}
                              className="border-2 flex-1 bg-t-bg text-t-c1 uppercase outline-none font-bold h-[36px] p-2 cursor-text"
                              style={{ fontSize: 18, letterSpacing: 2, borderColor: editingPlayerId === p.id ? 'var(--color-t-c4)' : 'var(--color-t-c2)', WebkitUserSelect: 'text' }}
                            />
                            <button
                              onClick={() => toggleExpanded(p.id)}
                              className="flex items-center justify-between border-2 border-t-c1 px-3 h-[36px] shrink-0"
                              style={{ width: 88 }}
                            >
                              <span className="text-t-c4 font-bold" style={{ fontSize: 18 }}>{overall}</span>
                              <span className="text-t-c1/50 text-xs">{isExpanded ? '▲' : '▼'}</span>
                            </button>
                          </div>

                          {/* Expanded stats */}
                          {isExpanded && (
                            <div className="mt-3 space-y-[6px]">
                              {MM2_STATS.map(stat => (
                                <div key={stat.key} className="flex items-center gap-1">
                                  <span className={`shrink-0 font-bold ${stat.textColor}`} style={{ fontSize: 16, width: 36, paddingLeft: 5 }}>{stat.label}</span>
                                  <div style={{ flex: 1, minWidth: 0, marginLeft: -5 }}>
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

              {/* ── GAFFER VIEW ── */}
              {view === 'selection' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {players.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, isSelected: !x.isSelected } : x))}
                        className="p-2 border-2 text-left font-bold transition-all"
                        style={{
                          fontSize: 18,
                          background: p.isSelected ? 'var(--color-t-c4)' : 'var(--color-t-bg)',
                          color: p.isSelected ? 'var(--color-t-bg)' : 'var(--color-t-c1)',
                          borderColor: p.isSelected ? 'var(--color-t-c4)' : 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={balanceTeams}
                      className="w-[300px] border-4 border-t-c4 p-2 font-bold transition-all"
                      style={{ fontSize: 24, background: isGenerating ? 'var(--color-t-c4)' : 'var(--color-t-bg)', color: isGenerating ? 'var(--color-t-bg)' : 'var(--color-t-c4)' }}
                    >GENERATE TEAMS</button>
                  </div>

                  {teams && (
                    <>
                      <div ref={teamsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {[
                          { data: teams.team1, color: 'text-t-c1', headerColor: 'text-t-c4', border: 'border-t-c1' },
                          { data: teams.team2, color: 'text-t-c4', headerColor: 'text-t-c1', border: 'border-t-c4' },
                        ].map(t => (
                          <div key={t.data.name} className={`border-4 ${t.border} p-4`}>
                            <div className={`flex items-end border-b-2 ${t.border} mb-4 pb-2`}>
                              <h3 className={`flex-1 text-2xl font-bold truncate pr-2 ${t.headerColor}`}>{t.data.name}</h3>
                              {showPlayerDetails && (
                                <>
                                  <span className={`w-16 font-bold ${t.headerColor}`} style={{ fontSize: 20 }}>RTG</span>
                                  <span className={`w-10 font-bold ${t.headerColor}`} style={{ fontSize: 20 }}>
                                    {t.data.totalRating % 1 === 0 ? t.data.totalRating : t.data.totalRating.toFixed(1)}
                                  </span>
                                </>
                              )}
                            </div>
                            {t.data.players.map(p => (
                              <div key={p.id} className={`flex ${t.color}`} style={{ fontSize: 20 }}>
                                <span className="flex-1 truncate pr-2">{p.name}</span>
                                {showPlayerDetails && (
                                  <>
                                    <span className={`w-16 ${t.color}`}>{getEffectivePosition(p).substring(0, 3)}</span>
                                    <span className={`w-10 ${t.color}`}>
                                      {getEffectiveRating(p) % 1 === 0 ? getEffectiveRating(p) : getEffectiveRating(p).toFixed(1)}
                                    </span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center">
                        <div className="flex w-[300px] border-4 border-t-c1 text-lg font-bold">
                          <button onClick={() => setShowPlayerDetails(false)} className="flex-1 p-2 transition-all" style={{ fontSize: 24, background: !showPlayerDetails ? 'var(--color-t-c1)' : 'var(--color-t-bg)', color: !showPlayerDetails ? 'var(--color-t-bg)' : 'var(--color-t-c1)' }}>HIDE INFO</button>
                          <button onClick={() => setShowPlayerDetails(true)} className="flex-1 p-2 transition-all" style={{ fontSize: 24, background: showPlayerDetails ? 'var(--color-t-c1)' : 'var(--color-t-bg)', color: showPlayerDetails ? 'var(--color-t-bg)' : 'var(--color-t-c1)' }}>SHOW INFO</button>
                        </div>
                      </div>

                      <div className="flex justify-center pb-4">
                        <button
                          onClick={handleShareTeams}
                          className="w-[300px] border-4 border-t-c4 p-2 font-bold transition-all"
                          style={{ fontSize: 24, background: isSharing ? 'var(--color-t-c4)' : 'var(--color-t-bg)', color: isSharing ? 'var(--color-t-bg)' : 'var(--color-t-c4)' }}
                        >SHARE TEAMS</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── SETTINGS VIEW ── */}
              {view === 'settings' && !kitsView && !transfersView && (
                <div className="flex flex-col items-center gap-4 py-16">
                  <button onClick={() => setKitsView(true)} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>KITS</button>
                  <button onClick={() => setTransfersView(true)} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>TRANSFERS</button>
                  <button onClick={resetSquad} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>RESET SQUAD</button>
                </div>
              )}

              {view === 'settings' && kitsView && (
                <div className="space-y-2 pt-2">
                  <div className="flex mb-3" style={{ width: 'fit-content' }}>
                    <button onClick={() => setKitLeague('PL')} className="font-bold text-sm border-2 border-t-c1 px-3 py-1" style={{ background: kitLeague === 'PL' ? 'var(--color-t-c1)' : 'var(--color-t-bg)', color: kitLeague === 'PL' ? 'var(--color-t-bg)' : 'var(--color-t-c1)' }}>PL</button>
                    <button onClick={() => setKitLeague('INTL')} className="font-bold text-sm border-2 border-l-0 border-t-c1 px-3 py-1" style={{ background: kitLeague === 'INTL' ? 'var(--color-t-c1)' : 'var(--color-t-bg)', color: kitLeague === 'INTL' ? 'var(--color-t-bg)' : 'var(--color-t-c1)' }}>INTL</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(kitLeague === 'PL' ? KITS : INTL_KITS).map(kit => (
                      <button
                        key={kit.name}
                        onClick={() => { applyKit(kit); setKitsView(false); setView('squad'); }}
                        className="p-2 border-2 text-left text-sm font-bold border-t-c1"
                        style={{ background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}
                      >{kit.name}</button>
                    ))}
                  </div>
                </div>
              )}

              {view === 'settings' && transfersView && (
                <div className="space-y-2 pt-2">
                  <div className="relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {players.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setTransferCandidate(p.id)}
                          className="p-2 border-2 text-left text-sm font-bold transition-all"
                          style={{
                            background: transferCandidate === p.id ? 'var(--color-t-c4)' : 'var(--color-t-bg)',
                            color: transferCandidate === p.id ? 'var(--color-t-bg)' : 'var(--color-t-c1)',
                            borderColor: transferCandidate === p.id ? 'var(--color-t-c4)' : 'rgba(255,255,255,0.4)',
                          }}
                        >{p.name}</button>
                      ))}
                    </div>
                    {transferCandidate && <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'var(--color-t-bg)', opacity: 0.8 }} />}
                  </div>
                  {transferCandidate && (() => {
                    const p = players.find(x => x.id === transferCandidate);
                    return p ? (
                      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none" style={{ zIndex: 50 }}>
                        <div className="text-t-c4 font-bold text-center text-xl tracking-widest">{p.name}</div>
                        <button onClick={() => setTransferCandidate(null)} className="border-4 border-t-c2 py-2 text-xl font-bold bg-t-bg text-t-c2 pointer-events-auto" style={{ width: 'calc(50% - 8px)' }}>KEEP</button>
                        <button onClick={() => { setPlayers(prev => prev.filter(x => x.id !== transferCandidate)); setTransferCandidate(null); }} className="border-4 border-t-c4 py-2 text-xl font-bold bg-t-c4 text-t-bg pointer-events-auto" style={{ width: 'calc(50% - 8px)' }}>SELL</button>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

            </div>
          </div>{/* end scroll area */}

          {/* ── Bottom nav ── */}
          {view !== 'settings' && (
            <div
              className="bg-t-bg shrink-0 flex flex-col gap-4"
              style={{
                paddingTop: 16,
                paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                paddingLeft: 'max(16px, env(safe-area-inset-left))',
                paddingRight: 'max(16px, env(safe-area-inset-right))',
              }}
            >
              <nav className="flex w-full gap-4">
                <button onClick={() => setView('squad')} className="flex-1 py-2 border-4 border-t-c2 font-bold transition-all" style={{ fontSize: 'clamp(22px, 6vw, 26px)', background: view === 'squad' ? 'var(--color-t-c2)' : 'var(--color-t-bg)', color: view === 'squad' ? 'var(--color-t-bg)' : 'var(--color-t-c2)' }}>SQUAD</button>
                <button onClick={() => setView('selection')} className="flex-1 py-2 border-4 border-t-c3 font-bold transition-all" style={{ fontSize: 'clamp(22px, 6vw, 26px)', background: view === 'selection' ? 'var(--color-t-c3)' : 'var(--color-t-bg)', color: view === 'selection' ? 'var(--color-t-bg)' : 'var(--color-t-c3)' }}>GAFFER</button>
              </nav>
              <div className="text-center text-xs font-normal text-t-c1 normal-case" style={{ fontFamily: 'Courier New, monospace' }}>Copyright - Gary Neill Limited</div>
            </div>
          )}

        </div>
      </div>
    </ErrorBoundary>
  );
}
