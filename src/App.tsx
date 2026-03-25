import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import splashGif from './assets/splash-screen.gif';
import { supabase } from './supabaseClient';

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
  // ── Goalkeepers ──
  { name: 'THE CAT',     ratings: { GKP: 9, DEFENCE: 5, MIDFIELD: 4, ATTACK: 3, NRG: 6, SPD: 7 }, position: Position.GKP },
  { name: 'SIMMO',       ratings: { GKP: 8, DEFENCE: 5, MIDFIELD: 4, ATTACK: 3, NRG: 5, SPD: 5 }, position: Position.GKP },
  { name: 'DINO',        ratings: { GKP: 8, DEFENCE: 6, MIDFIELD: 4, ATTACK: 3, NRG: 5, SPD: 4 }, position: Position.GKP },
  { name: 'ROLANDO',     ratings: { GKP: 7, DEFENCE: 5, MIDFIELD: 4, ATTACK: 4, NRG: 7, SPD: 7 }, position: Position.GKP },
  // ── Defenders ──
  { name: 'CHOPPER',     ratings: { GKP: 4, DEFENCE: 9, MIDFIELD: 5, ATTACK: 4, NRG: 8, SPD: 4 }, position: Position.DEFENCE },
  { name: 'BIG MATT',    ratings: { GKP: 5, DEFENCE: 8, MIDFIELD: 4, ATTACK: 5, NRG: 6, SPD: 4 }, position: Position.DEFENCE },
  { name: 'THE FRIDGE',  ratings: { GKP: 5, DEFENCE: 8, MIDFIELD: 4, ATTACK: 4, NRG: 6, SPD: 3 }, position: Position.DEFENCE },
  { name: 'BARRY',       ratings: { GKP: 4, DEFENCE: 7, MIDFIELD: 5, ATTACK: 4, NRG: 6, SPD: 5 }, position: Position.DEFENCE },
  { name: 'VINNY',       ratings: { GKP: 4, DEFENCE: 8, MIDFIELD: 6, ATTACK: 4, NRG: 9, SPD: 5 }, position: Position.DEFENCE },
  // ── Midfielders ──
  { name: 'BUSTER',      ratings: { GKP: 4, DEFENCE: 6, MIDFIELD: 8, ATTACK: 6, NRG: 8, SPD: 6 }, position: Position.MIDFIELD },
  { name: 'TRICKY PETE', ratings: { GKP: 4, DEFENCE: 5, MIDFIELD: 8, ATTACK: 7, NRG: 7, SPD: 9 }, position: Position.MIDFIELD },
  { name: 'TIMBO',       ratings: { GKP: 4, DEFENCE: 6, MIDFIELD: 7, ATTACK: 5, NRG: 7, SPD: 6 }, position: Position.MIDFIELD },
  { name: 'GINGE',       ratings: { GKP: 4, DEFENCE: 5, MIDFIELD: 8, ATTACK: 6, NRG: 8, SPD: 8 }, position: Position.MIDFIELD },
  { name: 'ROBBO',       ratings: { GKP: 4, DEFENCE: 5, MIDFIELD: 7, ATTACK: 5, NRG: 9, SPD: 7 }, position: Position.MIDFIELD },
  { name: 'PSYCHO',      ratings: { GKP: 4, DEFENCE: 7, MIDFIELD: 8, ATTACK: 5, NRG: 10, SPD: 6 }, position: Position.MIDFIELD },
  { name: 'ROY',         ratings: { GKP: 4, DEFENCE: 6, MIDFIELD: 8, ATTACK: 5, NRG: 7, SPD: 5 }, position: Position.MIDFIELD },
  // ── Attackers ──
  { name: 'ERIC',        ratings: { GKP: 3, DEFENCE: 4, MIDFIELD: 7, ATTACK: 9, NRG: 6, SPD: 7 }, position: Position.ATTACK },
  { name: 'GAZZADONNA',  ratings: { GKP: 3, DEFENCE: 4, MIDFIELD: 8, ATTACK: 9, NRG: 7, SPD: 9 }, position: Position.ATTACK },
  { name: 'THE POSTMAN', ratings: { GKP: 3, DEFENCE: 4, MIDFIELD: 6, ATTACK: 8, NRG: 6, SPD: 7 }, position: Position.ATTACK },
  { name: 'JEZZINHO',    ratings: { GKP: 3, DEFENCE: 4, MIDFIELD: 7, ATTACK: 8, NRG: 8, SPD: 9 }, position: Position.ATTACK },
  { name: 'JAYJAY',      ratings: { GKP: 3, DEFENCE: 4, MIDFIELD: 6, ATTACK: 8, NRG: 8, SPD: 9 }, position: Position.ATTACK },
  { name: 'JONNYBOY',    ratings: { GKP: 3, DEFENCE: 4, MIDFIELD: 5, ATTACK: 7, NRG: 7, SPD: 7 }, position: Position.ATTACK },
  { name: 'GAV',         ratings: { GKP: 3, DEFENCE: 4, MIDFIELD: 6, ATTACK: 8, NRG: 7, SPD: 8 }, position: Position.ATTACK },
];

const GET_RANDOM_16 = (): Player[] => {
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => 0.5 - Math.random());
  const pick = (pos: Position, n: number) => shuffle(FAMOUS_PLAYERS.filter(p => p.position === pos)).slice(0, n);
  const squad = shuffle([...pick(Position.GKP, 2), ...pick(Position.DEFENCE, 4), ...pick(Position.MIDFIELD, 7), ...pick(Position.ATTACK, 5)]);
  const selectedIds = new Set(shuffle(squad).slice(0, 10).map(p => p.name));
  return squad.map(p => ({ ...p, id: crypto.randomUUID(), isSelected: selectedIds.has(p.name), ratings: RANDOM_MM2_RATINGS() }));
};

const SPLASH_KITS_DATA = [
  { bg: '#EF0107', c4: '#ffffff', outline: '#003672' }, // Arsenal        — navy outline
  { bg: '#7ab4e3', c4: '#670E36', outline: '#ffd600' }, // Aston Villa    — gold outline
  { bg: '#DA291C', c4: '#000000', outline: '#ffffff' }, // Bournemouth    — white outline
  { bg: '#e30613', c4: '#000000', outline: '#ffffff' }, // Brentford      — white outline
  { bg: '#0057B8', c4: '#ffcd00', outline: '#ffffff' }, // Brighton       — white outline
  { bg: '#034694', c4: '#DBA111', outline: '#ffffff' }, // Chelsea        — white outline
  { bg: '#1B458F', c4: '#C4122E', outline: '#ffffff' }, // Crystal Palace — white outline
  { bg: '#003399', c4: '#ffdf1c', outline: '#ffffff' }, // Everton        — white outline
  { bg: '#ffffff', c4: '#ce0007', outline: '#000000' }, // Fulham         — black outline
  { bg: '#0044A0', c4: '#ffffff', outline: '#FF0000' }, // Ipswich        — red outline
  { bg: '#003090', c4: '#FDBE11', outline: '#ffffff' }, // Leicester      — white outline
  { bg: '#b20622', c4: '#fced5e', outline: '#ffffff' }, // Liverpool      — white outline
  { bg: '#6CABDD', c4: '#ffffff', outline: '#1C2C5B' }, // Man City       — navy outline
  { bg: '#DA291C', c4: '#ffffff', outline: '#FBE122' }, // Man Utd        — yellow outline
  { bg: '#030000', c4: '#ffffff', outline: '#41B0E4' }, // Newcastle      — blue outline
  { bg: '#DD0000', c4: '#ffffff', outline: '#000000' }, // Nott'm Forest  — black outline
  { bg: '#D71920', c4: '#ffffff', outline: '#000000' }, // Southampton    — black outline
  { bg: '#132257', c4: '#ffffff', outline: '#BCBEC0' }, // Spurs          — silver outline
  { bg: '#7A263A', c4: '#F3D459', outline: '#1BB1E7' }, // West Ham       — blue outline
  { bg: '#FDB913', c4: '#000000', outline: '#ffffff' }, // Wolves         — white outline
];

const KITS = [
  { name: 'ARSENAL',        bg: '#EF0107', c1: '#ffffff', c2: '#003672', c3: '#003672', c4: '#003672' },
  { name: 'ASTON VILLA',    bg: '#7ab4e3', c1: '#ffffff', c2: '#ffffff', c3: '#ffd600', c4: '#670E36' },
  { name: 'BOURNEMOUTH',    bg: '#DA291C', c1: '#ffffff', c2: '#ffffff', c3: '#000000', c4: '#000000' },
  { name: 'BRENTFORD',      bg: '#e30613', c1: '#ffffff', c2: '#ffffff', c3: '#000000', c4: '#000000' },
  { name: 'BRIGHTON',       bg: '#0057B8', c1: '#ffffff', c2: '#ffffff', c3: '#ffcd00', c4: '#ffcd00' },
  { name: 'BURNLEY',        bg: '#6C1D45', c1: '#ffffff', c2: '#8DC8E8', c3: '#8DC8E8', c4: '#8DC8E8' },
  { name: 'CHELSEA',        bg: '#034694', c1: '#ffffff', c2: '#ffffff', c3: '#DBA111', c4: '#DBA111' },
  { name: 'CRYSTAL PALACE', bg: '#1B458F', c1: '#ffffff', c2: '#d4d1d2', c3: '#C4122E', c4: '#C4122E' },
  { name: 'EVERTON',        bg: '#003399', c1: '#ffffff', c2: '#ffffff', c3: '#ffdf1c', c4: '#ffdf1c' },
  { name: 'FULHAM',         bg: '#ffffff', c1: '#000000', c2: '#ce0007', c3: '#CC0000', c4: '#ce0007', lightBg: true },
  { name: 'LEEDS',          bg: '#ffffff', c1: '#1D428A', c2: '#ffb016', c3: '#ffb016', c4: '#ffb016', lightBg: true, box1: '#1D428A' },
  { name: 'LIVERPOOL',      bg: '#b20622', c1: '#ffffff', c2: '#0bc9b0', c3: '#F6EB61', c4: '#fced5e' },
  { name: 'MAN CITY',       bg: '#6CABDD', c1: '#ffffff', c2: '#1C2C5B', c3: '#1C2C5B', c4: '#1C2C5B' },
  { name: 'MAN UTD',        bg: '#DA291C', c1: '#ffffff', c2: '#000000', c3: '#FBE122', c4: '#FBE122' },
  { name: 'NEWCASTLE',      bg: '#030000', c1: '#ffffff', c2: '#ffffff', c3: '#41B0E4', c4: '#41B0E4' },
  { name: "NOTT'M FOREST",  bg: '#DD0000', c1: '#ffffff', c2: '#030000', c3: '#000000', c4: '#000000' },
  { name: 'SPURS',          bg: '#132257', c1: '#ffffff', c2: '#bcbec0', c3: '#BCBEC0', c4: '#BCBEC0' },
  { name: 'SUNDERLAND',     bg: '#EB172B', c1: '#000000', c2: '#ffffff', c3: '#000000', c4: '#000000' },
  { name: 'WEST HAM',       bg: '#7A263A', c1: '#ffffff', c2: '#1BB1E7', c3: '#1BB1E7', c4: '#F3D459' },
  { name: 'WOLVES',         bg: '#e27c2f', c1: '#000000', c2: '#ffffff', c3: '#FFFFFF', c4: '#000000' },
];

const INTL_KITS = [
  { name: 'ARGENTINA',   bg: '#6AAAE5', c1: '#ffffff', c2: '#FAD755', c3: '#FAD755', c4: '#FAD755' },
  { name: 'AUSTRALIA',   bg: '#00843D', c1: '#ffffff', c2: '#FFD700', c3: '#FFD700', c4: '#FFD700' },
  { name: 'BELGIUM',     bg: '#000000', c1: '#ffffff', c2: '#FFD700', c3: '#EF3340', c4: '#FFD700' },
  { name: 'BRAZIL',      bg: '#FFC700', c1: '#058032', c2: '#ffffff', c3: '#002776', c4: '#058032' },
  { name: 'CROATIA',     bg: '#FF0000', c1: '#ffffff', c2: '#003389', c3: '#003389', c4: '#003389' },
  { name: 'ENGLAND',     bg: '#E70017', c1: '#ffffff', c2: '#ffffff', c3: '#00247D', c4: '#00247D' },
  { name: 'FRANCE',      bg: '#002395', c1: '#ffffff', c2: '#ED2939', c3: '#ED2939', c4: '#ED2939' },
  { name: 'GERMANY',     bg: '#ffffff', c1: '#000000', c2: '#D00000', c3: '#FFBC00', c4: '#D00000', lightBg: true },
  { name: 'ITALY',       bg: '#0046BE', c1: '#ffffff', c2: '#CD212A', c3: '#CD212A', c4: '#CD212A' },
  { name: 'IVORY COAST', bg: '#F77F00', c1: '#ffffff', c2: '#00723B', c3: '#00723B', c4: '#00723B' },
  { name: 'MEXICO',      bg: '#09914F', c1: '#ffffff', c2: '#9E1A1D', c3: '#9E1A1D', c4: '#9E1A1D' },
  { name: 'MOROCCO',     bg: '#D21E28', c1: '#ffffff', c2: '#024D29', c3: '#024D29', c4: '#024D29' },
  { name: 'NETHERLANDS', bg: '#FF4F00', c1: '#ffffff', c2: '#003DA5', c3: '#003DA5', c4: '#003DA5' },
  { name: 'PORTUGAL',    bg: '#006600', c1: '#ffffff', c2: '#FF0000', c3: '#FFD700', c4: '#FF0000' },
  { name: 'SCOTLAND',    bg: '#1F3077', c1: '#ffffff', c2: '#FFD700', c3: '#E32F43', c4: '#FFD700' },
  { name: 'SENEGAL',     bg: '#00853F', c1: '#ffffff', c2: '#FDEF42', c3: '#E31B23', c4: '#FDEF42' },
  { name: 'SPAIN',       bg: '#8D1411', c1: '#ffffff', c2: '#F1BF00', c3: '#F1BF00', c4: '#F1BF00' },
  { name: 'TURKEY',      bg: '#E30A17', c1: '#000000', c2: '#ffffff', c3: '#ffffff', c4: '#000000' },
  { name: 'URUGUAY',     bg: '#5EB6E4', c1: '#ffffff', c2: '#000000', c3: '#FFC905', c4: '#000000' },
  { name: 'WALES',       bg: '#C8102E', c1: '#ffffff', c2: '#FFD700', c3: '#004B87', c4: '#FFD700' },
];

// Kits shown to new users on first load (curated for readability)
const DEFAULT_KITS = [...KITS, ...INTL_KITS].filter(k =>
  ['ASTON VILLA', 'BRIGHTON', 'FULHAM', 'WEST HAM', 'AUSTRALIA', 'NETHERLANDS', 'PORTUGAL', 'SPAIN'].includes(k.name)
)

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
  const isDragging = React.useRef(false);

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

  const getValueFromX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, clientX - rect.left);
    const index = Math.floor(x / (cellSize + 3));
    return Math.max(1, Math.min(10, index + 1));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const v = getValueFromX(e.clientX);
    if (v !== null) onChange(v);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const v = getValueFromX(e.clientX);
    if (v !== null) onChange(v);
  };

  const handlePointerUp = () => { isDragging.current = false; };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ display: 'flex', gap: '3px', width: '100%', touchAction: 'none' }}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
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
export default function App({ userId, onSaveToCloud }: { userId: string | null, onSaveToCloud?: () => void }) {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const PLAYERS_VERSION = 'v4';
      if (localStorage.getItem('ceefax_players_version') !== PLAYERS_VERSION) {
        localStorage.removeItem('ceefax_players_cache');
        localStorage.setItem('ceefax_players_version', PLAYERS_VERSION);
        return GET_RANDOM_16();
      }
      const cached = localStorage.getItem('ceefax_players_cache');
      return cached ? JSON.parse(cached) : GET_RANDOM_16();
    } catch { return GET_RANDOM_16(); }
  });
  const [view, setView] = useState<'squad' | 'selection' | 'settings'>('squad');
  const [teams, setTeams] = useState<{ team1: Team; team2: Team } | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [newPlayerName, setNewPlayerName] = useState('');
  const [splashDone, setSplashDone] = useState(false);
  const [splashKit, setSplashKit] = useState(0);
  const [splashKits] = useState(() => [...SPLASH_KITS_DATA].sort(() => Math.random() - 0.5));
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [editingTeamName, setEditingTeamName] = useState<'team1' | 'team2' | null>(null);
  const [customTeamNames, setCustomTeamNames] = useState<[string, string]>(() => {
    try { const s = localStorage.getItem('customTeamNames'); return s ? JSON.parse(s) : ['', '']; } catch { return ['', '']; }
  });
  const [teamNamesView, setTeamNamesView] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [showPlayerDetails, setShowPlayerDetails] = useState(true);
  const [activeKit, setActiveKit] = useState<typeof KITS[0] | null>(null);
  const [kitsView, setKitsView] = useState(false);
  const [kitLeague, setKitLeague] = useState<'PL' | 'INTL'>('PL');
  const [transfersView, setTransfersView] = useState(false);
  const [transferCandidate, setTransferCandidate] = useState<string | null>(null);
  const [reorderView, setReorderView] = useState(false);
  const [activeDrag, setActiveDrag] = useState<{ id: string; floatX: number; floatY: number; width: number; height: number; insertIndex: number; } | null>(null);
  const activeDragRef = useRef<typeof activeDrag>(null);
  const dragStartRef = useRef<{ startPointerX: number; startPointerY: number; startCardX: number; startCardY: number; id: string; width: number; height: number; } | null>(null);
  const lastInsertRef = useRef<{ pointerX: number; pointerY: number; index: number } | null>(null);
  const playersRef = useRef(players);
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
    const appKit = saved ? JSON.parse(saved) : DEFAULT_KITS[Math.floor(Math.random() * DEFAULT_KITS.length)];
    setActiveKit(appKit);
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    const applyAppKit = () => {
      root.style.setProperty('--color-t-bg', appKit.bg);
      root.style.setProperty('--color-t-c1', appKit.c1);
      root.style.setProperty('--color-t-c2', appKit.c2);
      root.style.setProperty('--color-t-c3', appKit.c3);
      root.style.setProperty('--color-t-c4', appKit.c4);
      document.body.style.removeProperty('background-color');
      if (meta) meta.content = appKit.bg;
      setSplashDone(true);
    };
    if (Capacitor.isNativePlatform()) {
      const timeout = setTimeout(applyAppKit, 3200);
      return () => clearTimeout(timeout);
    }
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
        setTimeout(applyAppKit, 200);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // ── Scroll to top on view change ──
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // ── Fetch players from Supabase (cloud mode only) ──
  useEffect(() => {
    if (!userId) return;
    supabase.from('players').select('*').eq('user_id', userId).then(({ data }) => {
      if (data && data.length > 0) {
        setPlayers(data.map((p: any) => {
          const r = typeof p.ratings === 'string' ? JSON.parse(p.ratings) : p.ratings;
          const merged = { ...DEFAULT_RATINGS(), ...r };
          const isFlat = merged[Position.GKP] === merged[Position.DEFENCE] &&
                         merged[Position.DEFENCE] === merged[Position.MIDFIELD] &&
                         merged[Position.MIDFIELD] === merged[Position.ATTACK];
          return { ...p, ratings: isFlat ? RANDOM_MM2_RATINGS() : merged };
        }));
      } else {
        // No cloud data yet — migrate local data if available
        try {
          const cached = localStorage.getItem('ceefax_players_cache');
          if (cached) {
            const local = JSON.parse(cached);
            if (local.length > 0) setPlayers(local);
          }
        } catch {}
      }
    });
  }, [userId]);

  // ── Persist players ──
  useEffect(() => {
    if (players.length === 0) return;
    try { localStorage.setItem('ceefax_players_cache', JSON.stringify(players)); } catch {}
    if (!userId) return; // local mode: localStorage only
    const timer = setTimeout(() => {
      (async () => {
        await supabase.from('players').delete().eq('user_id', userId);
        await supabase.from('players').insert(
          players.map(p => ({
            id: p.id,
            user_id: userId,
            name: p.name,
            ratings: p.ratings,
            position: p.position,
            isSelected: p.isSelected,
          }))
        );
      })();
    }, 1000);
    return () => clearTimeout(timer);
  }, [players, userId]);

  // ── Keep drag refs in sync ──
  useEffect(() => { activeDragRef.current = activeDrag; }, [activeDrag]);
  useEffect(() => { playersRef.current = players; }, [players]);

  // ── Global pointer events for reorder drag ──
  useEffect(() => {
    const computeInsertIndex = (floatX: number, floatY: number, width: number, height: number, id: string): number => {
      const cx = floatX + width / 2;
      const cy = floatY + height / 2;
      const cards = document.querySelectorAll('[data-reorder-id]');
      const without = playersRef.current.filter(p => p.id !== id);
      let bestIndex = without.length;
      let bestDist = Infinity;
      cards.forEach(card => {
        const cardId = (card as HTMLElement).dataset.reorderId;
        const idx = without.findIndex(p => p.id === cardId);
        if (idx === -1) return;
        const rect = card.getBoundingClientRect();
        const cardCX = rect.left + rect.width / 2;
        const cardCY = rect.top + rect.height / 2;
        const dist = Math.hypot(cx - cardCX, cy - cardCY);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = cx < cardCX ? idx : idx + 1;
        }
      });
      return bestIndex;
    };
    const handleMove = (e: PointerEvent) => {
      const start = dragStartRef.current;
      if (!start) return;
      const floatX = start.startCardX + (e.clientX - start.startPointerX);
      const floatY = start.startCardY + (e.clientY - start.startPointerY);
      const candidate = computeInsertIndex(floatX, floatY, start.width, start.height, start.id);
      // Hysteresis: only accept a new insertIndex once the pointer has moved
      // at least 40% of a card width away from where the last change happened.
      const last = lastInsertRef.current;
      let insertIndex: number;
      if (last === null) {
        insertIndex = candidate;
        lastInsertRef.current = { pointerX: e.clientX, pointerY: e.clientY, index: candidate };
      } else if (candidate !== last.index) {
        const moved = Math.hypot(e.clientX - last.pointerX, e.clientY - last.pointerY);
        if (moved > start.width * 0.4) {
          insertIndex = candidate;
          lastInsertRef.current = { pointerX: e.clientX, pointerY: e.clientY, index: candidate };
        } else {
          insertIndex = last.index;
        }
      } else {
        insertIndex = last.index;
      }
      setActiveDrag(prev => prev ? { ...prev, floatX, floatY, insertIndex } : null);
    };
    const handleUp = () => {
      const ad = activeDragRef.current;
      if (!ad) return;
      setPlayers(prev => {
        const without = prev.filter(p => p.id !== ad.id);
        const idx = Math.min(ad.insertIndex, without.length);
        const dragged = prev.find(p => p.id === ad.id)!;
        return [...without.slice(0, idx), dragged, ...without.slice(idx)];
      });
      dragStartRef.current = null;
      lastInsertRef.current = null;
      setActiveDrag(null);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

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
    const shuffledNames = (customTeamNames[0].trim() && customTeamNames[1].trim())
      ? [customTeamNames[0].trim().toUpperCase(), customTeamNames[1].trim().toUpperCase()]
      : [...TEAM_NAMES].sort(() => 0.5 - Math.random());
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

  const buildShareText = () => {
    if (!teams) return '';
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
    return `${formatTeam(teams.team1)}\n\n${formatTeam(teams.team2)}`.toUpperCase();
  };

  const handleShareTeams = () => {
    if (!teams) return;
    if (!Capacitor.isNativePlatform()) {
      setShowShareOverlay(true);
    } else {
      // iOS fallback (not used since app is submitted, but keeps parity)
      const body = buildShareText();
      window.location.href = `mailto:?subject=${encodeURIComponent(`Teams for ${new Date().toLocaleDateString()}`)}&body=${encodeURIComponent(body)}`;
    }
  };

  const handleShareEmail = () => {
    const body = buildShareText();
    window.location.href = `mailto:?subject=${encodeURIComponent(`Teams for ${new Date().toLocaleDateString()}`)}&body=${encodeURIComponent(body)}`;
    setShowShareOverlay(false);
  };

  const handleShareWhatsApp = () => {
    const body = buildShareText();
    window.open(`https://wa.me/?text=${encodeURIComponent(body)}`, '_blank');
    setShowShareOverlay(false);
  };

  const handleShareClipboard = () => {
    const body = buildShareText();
    navigator.clipboard.writeText(body).then(() => {
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 1500);
    });
    setShowShareOverlay(false);
  };

  const handleReorderPointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const index = players.findIndex(p => p.id === id);
    const without = players.filter(p => p.id !== id);
    dragStartRef.current = { startPointerX: e.clientX, startPointerY: e.clientY, startCardX: rect.left, startCardY: rect.top, id, width: rect.width, height: rect.height };
    lastInsertRef.current = null;
    setActiveDrag({ id, floatX: rect.left, floatY: rect.top, width: rect.width, height: rect.height, insertIndex: Math.min(index, without.length) });
  };

  // ── Colour rules ──
  const box1Color = activeKit?.box1 ?? (activeKit?.lightBg ? '#000000' : '#ffffff');
  const box2Color = activeKit?.c4 ?? '#ffffff';

  // ── Splash screen ──
  if (!splashDone) {
    if (Capacitor.isNativePlatform()) {
      return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#ffffff' }}>
          <img src={splashGif} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    }
    const kit = splashKits[splashKit] || splashKits[0];
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: kit.bg, fontFamily: "'Barlow Condensed', sans-serif" }}>
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
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .team-name-cursor::after { content: '|'; margin-left: 2px; animation: blink 1s step-start infinite; }
      `}</style>
      <style>{`.lazy-placeholder::placeholder { color: var(--color-t-c1); opacity: 0.5; }`}</style>

      {/* ── Outer shell ── */}
      <div
        className="bg-t-bg text-t-c1 uppercase"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', justifyContent: 'center',
          overflow: 'hidden',
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {/* ── Inner column: max 1024px ── */}
        <div style={{ width: '100%', maxWidth: 1024, display: 'flex', flexDirection: 'column' }}>

          {/* ── Header ── */}
          <header
            ref={headerRef}
            className="bg-t-bg shrink-0"
            style={{
              paddingTop: 'calc(max(20px, env(safe-area-inset-top)) + 10px)',
              paddingLeft: 'max(16px, env(safe-area-inset-left))',
              paddingRight: 'max(16px, env(safe-area-inset-right))',
              paddingBottom: 16,
            }}
          >
            <div style={{ marginBottom: 4, position: 'relative' }}>
              <div className="text-t-c4 leading-none" style={{ fontSize: 60, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>
                LAZY GAFFER
              </div>
              <div style={{ position: 'absolute', right: 0, bottom: 4 }}>
                <button
                  onClick={() => { setView(v => v === 'settings' ? 'squad' : 'settings'); setKitsView(false); setTransfersView(false); setTransferCandidate(null); setReorderView(false); setTeamNamesView(false); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block' }}
                >
                  <svg width="24" height="24" viewBox="0 0 490 490" fill="var(--color-t-c4)" style={{ display: 'block' }}>
                    <path d="M489.927,239.193c-0.015-0.609-0.038-1.217-0.057-1.825c-0.041-1.337-0.09-2.671-0.151-4.003c-0.033-0.688-0.068-1.376-0.106-2.063c-0.071-1.293-0.154-2.583-0.245-3.871c-0.046-0.647-0.089-1.294-0.141-1.94c-0.121-1.55-0.26-3.094-0.411-4.635c-0.034-0.355-0.063-0.712-0.099-1.067c-0.192-1.879-0.408-3.751-0.643-5.618c-0.068-0.552-0.148-1.101-0.221-1.652c-0.177-1.33-0.359-2.657-0.558-3.98c-0.102-0.682-0.209-1.362-0.316-2.042c-0.191-1.216-0.393-2.429-0.603-3.639c-0.117-0.676-0.234-1.353-0.356-2.027c-0.24-1.319-0.495-2.633-0.756-3.945c-0.105-0.53-0.204-1.062-0.313-1.59c-0.371-1.8-0.761-3.593-1.171-5.378c-0.11-0.483-0.232-0.963-0.346-1.444c-0.314-1.327-0.634-2.65-0.968-3.968c-0.173-0.679-0.353-1.356-0.531-2.033c-0.298-1.133-0.603-2.264-0.917-3.39c-0.195-0.699-0.392-1.397-0.592-2.094c-0.333-1.156-0.678-2.306-1.028-3.455c-0.19-0.627-0.377-1.256-0.572-1.88c-0.535-1.709-1.085-3.412-1.657-5.104c-0.124-0.368-0.258-0.732-0.384-1.101c-0.468-1.362-0.943-2.721-1.435-4.073c-0.244-0.671-0.496-1.338-0.745-2.007c-0.393-1.052-0.79-2.101-1.197-3.146c-0.276-0.713-0.557-1.424-0.841-2.133c-0.409-1.023-0.827-2.042-1.25-3.059c-0.282-0.68-0.563-1.36-0.851-2.037c-0.517-1.212-1.047-2.416-1.583-3.618c-0.208-0.467-0.409-0.938-0.62-1.403c-0.714-1.576-1.447-3.142-2.194-4.7c-0.311-0.65-0.632-1.293-0.948-1.939c-0.482-0.983-0.967-1.965-1.461-2.94c-0.357-0.704-0.719-1.404-1.082-2.104c-0.48-0.926-0.967-1.847-1.459-2.766c-0.369-0.69-0.739-1.382-1.115-2.069c-0.545-0.995-1.102-1.982-1.66-2.968c-0.33-0.584-0.654-1.172-0.989-1.753c-0.857-1.485-1.729-2.959-2.616-4.424c-0.359-0.595-0.73-1.182-1.095-1.773c-0.581-0.941-1.163-1.88-1.756-2.812c-0.427-0.671-0.858-1.336-1.292-2.002c-0.554-0.854-1.113-1.704-1.678-2.55c-0.445-0.667-0.892-1.333-1.343-1.995c-0.601-0.881-1.21-1.755-1.822-2.628c-0.419-0.599-0.834-1.2-1.259-1.794c-0.988-1.383-1.988-2.758-3.004-4.12v0c-26.757-35.862-63.104-64.141-105.236-81.062c-0.002-0.001-0.004-0.001-0.006-0.002c-1.676-0.673-3.363-1.326-5.057-1.963c-0.122-0.046-0.242-0.093-0.363-0.138c-1.606-0.601-3.222-1.182-4.844-1.75c-0.218-0.076-0.436-0.154-0.654-0.23c-1.547-0.537-3.102-1.056-4.663-1.562c-0.301-0.098-0.602-0.197-0.903-0.294c-1.494-0.478-2.996-0.94-4.503-1.391c-0.38-0.113-0.759-0.227-1.138-0.338c-1.444-0.424-2.895-0.834-4.35-1.232c-0.454-0.125-0.909-0.248-1.365-0.37c-1.395-0.372-2.794-0.734-4.199-1.082c-0.527-0.131-1.057-0.259-1.586-0.387c-1.348-0.325-2.698-0.641-4.055-0.943c-0.597-0.133-1.195-0.261-1.793-0.391c-1.303-0.28-2.606-0.553-3.916-0.813c-0.668-0.132-1.338-0.258-2.008-0.385c-1.252-0.237-2.506-0.47-3.765-0.688c-0.741-0.129-1.486-0.248-2.23-0.37c-1.2-0.197-2.401-0.391-3.607-0.57c-0.817-0.122-1.638-0.23-2.457-0.344c-1.146-0.158-2.292-0.318-3.444-0.46c-0.895-0.111-1.795-0.207-2.693-0.308c-1.088-0.122-2.175-0.248-3.268-0.356c-0.985-0.098-1.975-0.177-2.964-0.263c-1.017-0.088-2.031-0.183-3.052-0.259c-1.103-0.082-2.213-0.143-3.32-0.21c-0.917-0.056-1.831-0.121-2.751-0.167c-1.295-0.064-2.597-0.104-3.896-0.148c-0.743-0.025-1.484-0.063-2.23-0.081C249.121,0.027,247.064,0,245,0c-2.064,0-4.121,0.027-6.173,0.078c-0.747,0.019-1.488,0.056-2.233,0.081c-1.299,0.044-2.599,0.084-3.893,0.148c-0.922,0.045-1.838,0.111-2.756,0.167c-1.105,0.067-2.213,0.129-3.315,0.21c-1.022,0.076-2.039,0.171-3.058,0.259c-0.986,0.085-1.975,0.165-2.957,0.263c-1.096,0.108-2.186,0.235-3.277,0.357c-0.895,0.101-1.791,0.196-2.683,0.307c-1.155,0.143-2.304,0.303-3.454,0.461c-0.816,0.113-1.634,0.222-2.447,0.342c-1.21,0.18-2.414,0.375-3.618,0.572c-0.739,0.121-1.48,0.239-2.218,0.367c-1.264,0.219-2.521,0.453-3.778,0.69c-0.665,0.127-1.33,0.251-1.993,0.382c-1.314,0.261-2.624,0.535-3.931,0.816c-0.593,0.127-1.185,0.255-1.776,0.387c-1.362,0.304-2.721,0.621-4.074,0.947c-0.521,0.126-1.043,0.253-1.563,0.382c-1.413,0.351-2.82,0.714-4.224,1.089c-0.446,0.119-0.893,0.24-1.338,0.362c-1.464,0.4-2.923,0.813-4.377,1.24c-0.369,0.108-0.737,0.219-1.104,0.329c-1.52,0.453-3.032,0.92-4.538,1.402c-0.288,0.092-0.575,0.186-0.862,0.28c-1.576,0.511-3.146,1.035-4.707,1.577c-0.2,0.069-0.399,0.141-0.6,0.211c-1.641,0.574-3.275,1.163-4.9,1.771c-0.097,0.036-0.193,0.074-0.289,0.11C114.502,32.253,76.252,61.402,48.41,98.773c-0.975,1.309-1.937,2.627-2.886,3.956c-0.448,0.628-0.888,1.264-1.33,1.896c-0.587,0.839-1.173,1.678-1.75,2.524c-0.466,0.683-0.925,1.369-1.384,2.056c-0.549,0.823-1.093,1.65-1.633,2.48c-0.445,0.687-0.891,1.372-1.33,2.063c-0.572,0.899-1.133,1.805-1.693,2.712c-0.385,0.623-0.774,1.241-1.153,1.867c-0.88,1.455-1.746,2.918-2.597,4.393c-0.348,0.603-0.685,1.213-1.027,1.819c-0.547,0.965-1.091,1.931-1.624,2.904c-0.382,0.698-0.757,1.4-1.133,2.102c-0.485,0.905-0.965,1.814-1.438,2.727c-0.369,0.709-0.735,1.42-1.098,2.134c-0.488,0.963-0.966,1.932-1.441,2.902c-0.322,0.657-0.648,1.311-0.965,1.972c-0.736,1.536-1.459,3.079-2.163,4.632c-0.224,0.494-0.438,0.993-0.659,1.488c-0.531,1.193-1.058,2.388-1.57,3.591c-0.29,0.68-0.57,1.363-0.854,2.045c-0.422,1.014-0.839,2.031-1.247,3.051c-0.284,0.711-0.564,1.423-0.843,2.137c-0.405,1.044-0.802,2.091-1.194,3.142c-0.25,0.67-0.503,1.338-0.748,2.012c-0.489,1.349-0.964,2.704-1.431,4.063c-0.127,0.371-0.262,0.738-0.387,1.109c-0.572,1.693-1.122,3.396-1.657,5.105c-0.195,0.624-0.382,1.251-0.572,1.877c-0.35,1.148-0.694,2.299-1.027,3.454c-0.201,0.697-0.398,1.396-0.593,2.097c-0.314,1.128-0.62,2.259-0.918,3.393c-0.178,0.675-0.357,1.348-0.528,2.025c-0.336,1.323-0.658,2.651-0.973,3.982c-0.112,0.479-0.232,0.954-0.343,1.433c-0.41,1.787-0.8,3.581-1.171,5.382c-0.109,0.526-0.207,1.056-0.313,1.583c-0.262,1.314-0.516,2.629-0.757,3.951c-0.122,0.674-0.239,1.35-0.357,2.025c-0.21,1.212-0.411,2.427-0.603,3.645c-0.107,0.678-0.214,1.355-0.315,2.035c-0.198,1.327-0.382,2.658-0.559,3.992c-0.072,0.547-0.151,1.092-0.22,1.641c-0.234,1.867-0.45,3.74-0.643,5.62c-0.036,0.355-0.064,0.712-0.099,1.067c-0.151,1.541-0.29,3.085-0.411,4.635c-0.052,0.645-0.095,1.293-0.141,1.94c-0.091,1.288-0.174,2.578-0.245,3.871c-0.038,0.687-0.073,1.375-0.106,2.063c-0.061,1.331-0.11,2.666-0.151,4.003c-0.019,0.608-0.042,1.215-0.057,1.825C0.028,241.124,0,243.059,0,245c0,1.737,0.027,3.468,0.065,5.196c0.017,0.778,0.037,1.556,0.061,2.332c0.021,0.667,0.049,1.331,0.075,1.996c1.684,44.022,14.979,85.063,36.915,120.154c0.003,0.004,0.005,0.008,0.007,0.012c4.157,6.648,8.622,13.081,13.379,19.281c0.025,0.034,0.052,0.068,0.078,0.102c4.707,6.129,9.695,12.029,14.949,17.681c0.122,0.131,0.244,0.262,0.366,0.393c0.999,1.069,2.005,2.132,3.022,3.183c0.042,0.044,0.085,0.087,0.127,0.131c3.161,3.262,6.412,6.436,9.748,9.519c0.106,0.098,0.211,0.197,0.318,0.295c0.988,0.91,1.985,1.809,2.988,2.702c0.275,0.246,0.552,0.491,0.828,0.736c0.981,0.865,1.965,1.724,2.959,2.573c0.229,0.197,0.463,0.391,0.693,0.587c3.172,2.692,6.414,5.304,9.723,7.835c0.33,0.253,0.659,0.509,0.991,0.76c0.944,0.715,1.896,1.42,2.852,2.121c0.451,0.332,0.903,0.661,1.356,0.99c0.936,0.677,1.873,1.35,2.818,2.014c0.443,0.311,0.891,0.618,1.337,0.927c3.143,2.177,6.339,4.282,9.585,6.314c0.547,0.342,1.091,0.686,1.64,1.023c0.901,0.554,1.808,1.099,2.716,1.641c0.612,0.366,1.227,0.729,1.843,1.089c0.895,0.523,1.791,1.044,2.692,1.557c0.637,0.361,1.276,0.715,1.916,1.071c3.139,1.747,6.318,3.425,9.539,5.036c0.71,0.355,1.418,0.711,2.132,1.059c0.882,0.431,1.77,0.853,2.657,1.273c0.729,0.345,1.461,0.687,2.194,1.024c0.888,0.409,1.774,0.816,2.668,1.214c0.753,0.336,1.51,0.663,2.267,0.992c0.884,0.384,1.765,0.772,2.654,1.146c0.002,0.001,0.004,0.002,0.007,0.003C179.337,483.221,211.376,490,245,490c33.172,0,64.796-6.606,93.649-18.552c0.002-0.001,0.005-0.002,0.007-0.003c1.484-0.615,2.96-1.246,4.43-1.889c0.149-0.065,0.299-0.131,0.448-0.196c1.438-0.633,2.87-1.278,4.295-1.938c0.121-0.056,0.242-0.113,0.363-0.169c7.491-3.484,14.777-7.335,21.835-11.531c0.148-0.088,0.297-0.175,0.445-0.264c1.264-0.755,2.519-1.522,3.768-2.299c0.258-0.16,0.516-0.321,0.772-0.482c1.213-0.761,2.419-1.53,3.618-2.312c0.247-0.162,0.493-0.325,0.74-0.488c1.232-0.81,2.46-1.626,3.677-2.457c0.049-0.034,0.098-0.068,0.148-0.102c3.943-2.699,7.803-5.512,11.577-8.431c0.195-0.151,0.393-0.299,0.588-0.451c1.017-0.792,2.025-1.597,3.028-2.404c0.407-0.327,0.815-0.653,1.221-0.983c0.93-0.758,1.853-1.523,2.771-2.294c0.467-0.391,0.932-0.784,1.395-1.179c0.883-0.752,1.762-1.508,2.634-2.272c0.481-0.421,0.957-0.848,1.434-1.273c0.858-0.764,1.715-1.526,2.561-2.302c0.445-0.408,0.884-0.823,1.326-1.234c1.824-1.695,3.625-3.416,5.397-5.165c0.247-0.243,0.498-0.481,0.743-0.726c0.709-0.705,1.404-1.422,2.104-2.136c0.581-0.593,1.164-1.183,1.739-1.782c0.657-0.684,1.306-1.376,1.954-2.067c0.608-0.648,1.215-1.297,1.816-1.951c0.618-0.673,1.231-1.351,1.843-2.031c0.626-0.697,1.247-1.398,1.865-2.102c0.576-0.657,1.152-1.315,1.723-1.979c0.659-0.768,1.311-1.542,1.96-2.318c0.517-0.616,1.037-1.229,1.547-1.851c0.814-0.991,1.615-1.993,2.414-2.997c0.333-0.419,0.674-0.832,1.004-1.253c1.101-1.402,2.184-2.818,3.254-4.244c0.393-0.522,0.775-1.053,1.162-1.578c0.706-0.957,1.41-1.915,2.102-2.882c0.426-0.594,0.844-1.193,1.265-1.792c0.645-0.917,1.284-1.838,1.917-2.765c0.418-0.614,0.834-1.23,1.247-1.848c0.631-0.943,1.254-1.892,1.872-2.845c0.388-0.597,0.776-1.193,1.158-1.794c0.664-1.043,1.316-2.094,1.965-3.148c0.317-0.515,0.64-1.026,0.953-1.543c0.938-1.548,1.86-3.106,2.764-4.676c0.016-0.026,0.031-0.052,0.046-0.077c0.001-0.001,0.001-0.003,0.002-0.004c19.162-33.328,30.691-71.595,32.253-112.416c0.026-0.665,0.054-1.329,0.075-1.996c0.023-0.777,0.044-1.554,0.061-2.332c0.038-1.728,0.065-3.459,0.065-5.196C490,243.059,489.972,241.124,489.927,239.193z M255,76.606l61.818-44.913c5.309,1.79,10.563,3.783,15.756,5.98C359.365,49.005,383.43,65.23,404.1,85.9c11.277,11.278,21.222,23.573,29.78,36.764l-21.575,68.122l-64.304,21.111L255,144.33V76.606z M85.901,85.9c20.67-20.67,44.734-36.895,71.525-48.227c5.192-2.196,10.446-4.19,15.757-5.98L235,76.606v67.724l-93.498,67.93l-63.704-21.152l-21.677-68.443C64.68,109.474,74.624,97.178,85.901,85.9z M125.224,388.634l-61.027-9.667c-10.638-14.319-19.519-29.834-26.522-46.395c-11.47-27.116-17.394-55.897-17.649-85.572l51.564-36.881l63.743,21.165l36.109,111.131L125.224,388.634z M342.379,447.901c-3.227,1.549-6.494,3.024-9.805,4.425C304.848,464.054,275.384,470,245,470c-30.383,0-59.848-5.946-87.573-17.674c-3.724-1.575-7.39-3.255-11.007-5.018l-7.053-44.533l49.84-49.84h118.586l42.842,42.841L342.379,447.901z M452.326,332.573c-5.737,13.564-12.734,26.427-20.922,38.507l-66.629,10.552l-44.498-44.499l34.584-106.44l63.272-20.773l51.842,37.079C469.72,276.676,463.796,305.457,452.326,332.573z"/>
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
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch' as any,
            }}
          >
            <div
              style={{
                paddingLeft: 'max(16px, env(safe-area-inset-left))',
                paddingRight: 'max(16px, env(safe-area-inset-right))',
                paddingTop: 0,
                paddingBottom: 24,
              }}
            >

              {/* ── SQUAD VIEW ── */}
              {view === 'squad' && (
                <div>
                  <div ref={addRowRef} className="flex gap-2 pt-2" style={{ paddingBottom: 30 }}>
                    <input
                      value={newPlayerName}
                      onChange={e => setNewPlayerName(e.target.value)}
                      placeholder={newPlayerName ? '' : placeholderText}
                      onKeyDown={e => e.key === 'Enter' && addPlayer()}
                      className="flex-1 bg-t-bg border-2 border-t-c2 text-t-c1 uppercase outline-none px-2 font-bold lazy-placeholder"
                      style={{ height: 36, fontSize: 18, letterSpacing: 2 }}
                    />
                    <button
                      onClick={addPlayer}
                      className="shrink-0 bg-t-bg border-2 border-t-c3 text-t-c3 font-bold tracking-widest text-lg active:bg-t-c3 active:text-t-bg transition-colors"
                      style={{ width: 72, height: 36 }}
                    >ADD</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '0 2rem' }}>
                    {players.map(p => {
                      const isExpanded = expandedPlayers.has(p.id);
                      const overall = (Object.values(p.ratings).reduce((a, b) => a + b, 0) / 6).toFixed(1);
                      return (
                        <section
                          key={p.id}
                          className="border-b pt-2 pb-3"
                          style={{ borderColor: box2Color }}
                        >
                          {/* Name row */}
                          <div ref={el => { playerCardRefs.current[p.id] = el; }} className="flex gap-2 items-center">
                            <input
                              value={p.name}
                              inputMode="text"
                              onFocus={() => setEditingPlayerId(p.id)}
                              onBlur={() => setEditingPlayerId(null)}
                              onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                              onChange={e => setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))}
                              className="border-2 flex-1 bg-t-bg text-t-c1 uppercase outline-none font-bold h-[36px] p-2 cursor-text"
                              style={{ fontSize: 18, letterSpacing: 2, borderColor: editingPlayerId === p.id ? 'var(--color-t-c4)' : box2Color, WebkitUserSelect: 'text' }}
                            />
                            <button
                              onClick={() => toggleExpanded(p.id)}
                              className="flex items-center justify-between border-2 px-2 h-[36px] shrink-0"
                              style={{ borderColor: box2Color, width: 72 }}
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
                                  <span className={`stat-label shrink-0 font-bold ${stat.textColor}`} style={{ width: 36, paddingLeft: 5 }}>{stat.label}</span>
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

                  {!userId && onSaveToCloud && (
                    <div className="flex justify-center" style={{ paddingTop: 16, paddingBottom: 12 }}>
                      <button
                        onClick={onSaveToCloud}
                        className="w-[300px] border-2 font-bold"
                        style={{ height: 36, fontSize: 16, letterSpacing: 2, background: 'var(--color-t-bg)', color: 'var(--color-t-c1)', borderColor: box2Color }}
                      >AUTO SAVE SQUAD</button>
                    </div>
                  )}
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
                        className="p-2 border-2 text-left font-bold uppercase transition-all"
                        style={{
                          fontSize: 18,
                          background: p.isSelected ? 'var(--color-t-c4)' : 'var(--color-t-bg)',
                          color: p.isSelected ? 'var(--color-t-bg)' : 'var(--color-t-c1)',
                          borderColor: 'var(--color-t-c4)',
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
                      <div ref={teamsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {([
                          { data: teams.team1, color: box1Color, key: 'team1' as const },
                          { data: teams.team2, color: box2Color, key: 'team2' as const },
                        ] as const).map(t => (
                          <div key={t.key} className="border-4 p-4" style={{ borderColor: t.color, color: t.color }}>
                            <div className="flex items-end border-b-2 mb-4 pb-2" style={{ borderColor: t.color }}>
                              {editingTeamName === t.key ? (
                                <input
                                  autoFocus
                                  defaultValue={t.data.name}
                                  className="flex-1 text-2xl font-bold bg-transparent outline-none pr-2 uppercase"
                                  style={{ color: t.color }}
                                  onBlur={e => {
                                    const val = e.target.value.trim().toUpperCase() || t.data.name;
                                    setTeams(prev => prev ? { ...prev, [t.key]: { ...prev[t.key], name: val } } : prev);
                                    setEditingTeamName(null);
                                  }}
                                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                />
                              ) : (
                                <h3
                                  className={`flex-1 text-2xl font-bold truncate pr-2 cursor-pointer${(!customTeamNames[0].trim() && !customTeamNames[1].trim()) ? ' team-name-cursor' : ''}`}
                                  onClick={() => setEditingTeamName(t.key)}
                                >{t.data.name}</h3>
                              )}
                              {showPlayerDetails && (
                                <>
                                  <span className="w-16 font-bold" style={{ fontSize: 20 }}>RTG</span>
                                  <span className="w-10 font-bold" style={{ fontSize: 20 }}>
                                    {t.data.totalRating % 1 === 0 ? t.data.totalRating : t.data.totalRating.toFixed(1)}
                                  </span>
                                </>
                              )}
                            </div>
                            {t.data.players.map(p => (
                              <div key={p.id} className="flex font-bold uppercase" style={{ fontSize: 20 }}>
                                <span className="flex-1 truncate pr-2">{p.name}</span>
                                {showPlayerDetails && (
                                  <>
                                    <span className="w-16">{getEffectivePosition(p).substring(0, 3)}</span>
                                    <span className="w-10">
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
                        <div className="flex w-[300px] border-4 text-lg font-bold" style={{ borderColor: box1Color }}>
                          <button onClick={() => setShowPlayerDetails(false)} className="flex-1 p-2 transition-all" style={{ fontSize: 24, background: !showPlayerDetails ? box1Color : 'var(--color-t-bg)', color: !showPlayerDetails ? 'var(--color-t-bg)' : box1Color }}>HIDE INFO</button>
                          <button onClick={() => setShowPlayerDetails(true)} className="flex-1 p-2 transition-all" style={{ fontSize: 24, background: showPlayerDetails ? box1Color : 'var(--color-t-bg)', color: showPlayerDetails ? 'var(--color-t-bg)' : box1Color }}>SHOW INFO</button>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={handleShareTeams}
                          className="w-[300px] border-4 p-2 font-bold transition-all"
                          style={{ fontSize: 24, borderColor: box2Color, background: isSharing ? box2Color : 'var(--color-t-bg)', color: isSharing ? 'var(--color-t-bg)' : box2Color }}
                        >SHARE TEAMS</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── SETTINGS VIEW ── */}
              {view === 'settings' && !kitsView && !transfersView && !reorderView && !teamNamesView && (
                <div className="flex flex-col items-center gap-4 py-16">
                  <button onClick={() => setKitsView(true)} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>KITS</button>
                  <button onClick={() => setTransfersView(true)} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>TRANSFERS</button>
                  <button onClick={() => setReorderView(true)} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>REORDER</button>
                  <button onClick={() => setTeamNamesView(true)} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>TEAM NAMES</button>
                  <button onClick={async () => {
                    const res = await fetch('/api/create-portal-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) })
                    const { url, error } = await res.json()
                    if (url) window.location.href = url
                    else alert(error || 'Could not open subscription portal')
                  }} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>SUBSCRIPTION</button>
                  <button onClick={() => window.location.href = '/privacy'} className="border-4 border-t-c1 py-2 text-xl font-bold" style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}>PRIVACY</button>
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
                        className="p-2 border-2 text-left font-bold border-t-c1"
                        style={{ background: 'var(--color-t-bg)', color: 'var(--color-t-c1)', fontSize: 16 }}
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
                          className="p-2 border-2 text-left font-bold uppercase transition-all"
                          style={{
                            fontSize: 18,
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
                        <div className="text-t-c4 font-bold uppercase text-center text-xl tracking-widest">{p.name}</div>
                        <button onClick={() => setTransferCandidate(null)} className="border-4 border-t-c2 py-2 text-xl font-bold bg-t-bg text-t-c2 pointer-events-auto" style={{ width: 'calc(50% - 8px)', maxWidth: 504 }}>KEEP</button>
                        <button onClick={() => { setPlayers(prev => prev.filter(x => x.id !== transferCandidate)); setTransferCandidate(null); }} className="border-4 border-t-c4 py-2 text-xl font-bold bg-t-c4 text-t-bg pointer-events-auto" style={{ width: 'calc(50% - 8px)', maxWidth: 504 }}>SELL</button>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {view === 'settings' && reorderView && (() => {
                const without = activeDrag ? players.filter(p => p.id !== activeDrag.id) : players;
                const insertIdx = activeDrag ? Math.min(activeDrag.insertIndex, without.length) : 0;
                const displayItems: ({ type: 'player'; player: typeof players[0] } | { type: 'ghost' })[] = activeDrag
                  ? [
                      ...without.slice(0, insertIdx).map(p => ({ type: 'player' as const, player: p })),
                      { type: 'ghost' as const },
                      ...without.slice(insertIdx).map(p => ({ type: 'player' as const, player: p })),
                    ]
                  : players.map(p => ({ type: 'player' as const, player: p }));
                return (
                  <div style={{ position: 'relative' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                      {displayItems.map((item, i) =>
                        item.type === 'ghost' ? (
                          <div
                            key="ghost"
                            style={{
                              height: activeDrag?.height ?? 40,
                              background: 'rgba(255,255,255,0.5)',
                              border: '2px solid transparent',
                            }}
                          />
                        ) : (
                          <div
                            key={item.player.id}
                            data-reorder-id={item.player.id}
                            onPointerDown={e => handleReorderPointerDown(e, item.player.id)}
                            className="p-2 border-2 text-left font-bold uppercase"
                            style={{
                              fontSize: 18,
                              cursor: 'grab',
                              touchAction: 'none',
                              background: 'var(--color-t-bg)',
                              color: 'var(--color-t-c1)',
                              borderColor: 'rgba(255,255,255,0.4)',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              WebkitTouchCallout: 'none',
                            } as React.CSSProperties}
                          >
                            {item.player.name}
                          </div>
                        )
                      )}
                    </div>
                    {activeDrag && (() => {
                      const p = players.find(x => x.id === activeDrag.id);
                      return p ? (
                        <div
                          className="p-2 border-2 text-left font-bold uppercase"
                          style={{
                            fontSize: 18,
                            position: 'fixed',
                            left: activeDrag.floatX,
                            top: activeDrag.floatY,
                            width: activeDrag.width,
                            height: activeDrag.height,
                            pointerEvents: 'none',
                            zIndex: 9999,
                            background: 'var(--color-t-c4)',
                            color: 'var(--color-t-bg)',
                            borderColor: 'var(--color-t-c4)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            transform: 'scale(1.05)',
                            transformOrigin: 'center center',
                            userSelect: 'none',
                          }}
                        >
                          {p.name}
                        </div>
                      ) : null;
                    })()}
                  </div>
                );
              })()}

              {/* ── TEAM NAMES VIEW ── */}
              {view === 'settings' && teamNamesView && (
                <div className="flex flex-col items-center gap-6 py-16">
                  <div className="text-t-c1 font-bold text-sm tracking-widest uppercase" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                    Set custom team names — leave blank for random
                  </div>
                  {(['TEAM 1', 'TEAM 2'] as const).map((label, i) => (
                    <div key={label} className="flex flex-col gap-2" style={{ width: 'calc(50% - 8px)' }}>
                      <label className="text-t-c1 font-bold text-xs tracking-widest uppercase" style={{ fontFamily: '"Rajdhani", sans-serif' }}>{label}</label>
                      <input
                        className="border-4 border-t-c1 bg-transparent text-t-c1 font-bold text-xl p-2 uppercase outline-none w-full"
                        style={{ fontFamily: '"Rajdhani", sans-serif', letterSpacing: 2 }}
                        maxLength={20}
                        value={customTeamNames[i]}
                        onChange={e => {
                          const updated: [string, string] = [...customTeamNames] as [string, string];
                          updated[i] = e.target.value.toUpperCase();
                          setCustomTeamNames(updated);
                          localStorage.setItem('customTeamNames', JSON.stringify(updated));
                        }}
                        placeholder="RANDOM"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const cleared: [string, string] = ['', ''];
                      setCustomTeamNames(cleared);
                      localStorage.setItem('customTeamNames', JSON.stringify(cleared));
                    }}
                    className="border-4 border-t-c1 py-2 text-xl font-bold"
                    style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}
                  >CLEAR</button>
                  <button
                    onClick={() => setTeamNamesView(false)}
                    className="border-4 border-t-c1 py-2 text-xl font-bold"
                    style={{ width: 'calc(50% - 8px)', background: 'var(--color-t-bg)', color: 'var(--color-t-c1)' }}
                  >DONE</button>
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
                <button onClick={() => setView('squad')} className="flex-1 py-2 border-4 font-bold transition-all" style={{ fontSize: 'clamp(20px, 5vw, 26px)', borderColor: box1Color, background: view === 'squad' ? box1Color : 'var(--color-t-bg)', color: view === 'squad' ? 'var(--color-t-bg)' : box1Color }}>SQUAD</button>
                <button onClick={() => setView('selection')} className="flex-1 py-2 border-4 font-bold transition-all" style={{ fontSize: 'clamp(20px, 5vw, 26px)', borderColor: box2Color, background: view === 'selection' ? box2Color : 'var(--color-t-bg)', color: view === 'selection' ? 'var(--color-t-bg)' : box2Color }}>GAFFER</button>
              </nav>
              <div className="text-center text-t-c1 normal-case" style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 500, fontSize: 12 }}>Copyright - Gary Neill Limited</div>
            </div>
          )}

        {/* ── Share overlay (desktop only) ── */}
        {showShareOverlay && !Capacitor.isNativePlatform() && (() => {
          const btnColor = activeKit?.lightBg ? '#000000' : '#ffffff';
          return (
            <div
              onClick={() => setShowShareOverlay(false)}
              style={{
                position: 'fixed', inset: 0,
                background: activeKit?.bg ?? 'var(--color-t-bg)',
                opacity: 0.95,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 24,
                zIndex: 100,
              }}
            >
              {[
                { label: 'EMAIL', action: handleShareEmail },
                { label: 'WHATSAPP', action: handleShareWhatsApp },
                { label: 'CLIPBOARD', action: handleShareClipboard },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={e => { e.stopPropagation(); action(); }}
                  className="w-[300px] border-4 p-2 font-bold"
                  style={{
                    fontSize: 24,
                    background: 'transparent',
                    color: btnColor,
                    borderColor: btnColor,
                    fontFamily: '"Rajdhani", sans-serif',
                    letterSpacing: 2,
                  }}
                >{label}</button>
              ))}
            </div>
          );
        })()}

        </div>
      </div>
    </ErrorBoundary>
  );
}
