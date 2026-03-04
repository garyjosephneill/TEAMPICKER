import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

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
  { name: 'THE CAT',    ratings: { GKP: 9, DEFENCE: 4, MIDFIELD: 3, ATTACK: 2, NRG: 6, SPD: 5 }, position: Position.GKP },
  { name: 'SIMMO',      ratings: { GKP: 8, DEFENCE: 5, MIDFIELD: 4, ATTACK: 3, NRG: 7, SPD: 6 }, position: Position.GKP },
  { name: 'CHOPPER',    ratings: { GKP: 3, DEFENCE: 10,MIDFIELD: 6, ATTACK: 4, NRG: 9, SPD: 5 }, position: Position.DEFENCE },
  { name: 'BIG JOHN',   ratings: { GKP: 4, DEFENCE: 9, MIDFIELD: 5, ATTACK: 5, NRG: 7, SPD: 4 }, position: Position.DEFENCE },
  { name: 'FRANCO',     ratings: { GKP: 2, DEFENCE: 9, MIDFIELD: 7, ATTACK: 4, NRG: 8, SPD: 7 }, position: Position.DEFENCE },
  { name: 'BARRY',      ratings: { GKP: 5, DEFENCE: 8, MIDFIELD: 4, ATTACK: 3, NRG: 6, SPD: 5 }, position: Position.DEFENCE },
  { name: 'BONES',      ratings: { GKP: 1, DEFENCE: 8, MIDFIELD: 6, ATTACK: 2, NRG: 7, SPD: 6 }, position: Position.DEFENCE },
  { name: 'LUNGS',      ratings: { GKP: 2, DEFENCE: 7, MIDFIELD: 10,ATTACK: 7, NRG: 10,SPD: 8 }, position: Position.MIDFIELD },
  { name: 'TRICKY PETE',ratings: { GKP: 1, DEFENCE: 4, MIDFIELD: 9, ATTACK: 8, NRG: 7, SPD: 9 }, position: Position.MIDFIELD },
  { name: 'WOR DAVE',   ratings: { GKP: 3, DEFENCE: 6, MIDFIELD: 9, ATTACK: 6, NRG: 8, SPD: 7 }, position: Position.MIDFIELD },
  { name: 'GADGET',     ratings: { GKP: 4, DEFENCE: 5, MIDFIELD: 8, ATTACK: 7, NRG: 8, SPD: 8 }, position: Position.MIDFIELD },
  { name: 'SWEATY',     ratings: { GKP: 2, DEFENCE: 8, MIDFIELD: 8, ATTACK: 5, NRG: 9, SPD: 6 }, position: Position.MIDFIELD },
  { name: 'BOBBY SCORE',ratings: { GKP: 1, DEFENCE: 3, MIDFIELD: 7, ATTACK: 10,NRG: 8, SPD: 9 }, position: Position.ATTACK },
  { name: 'GAZADONNA',  ratings: { GKP: 1, DEFENCE: 2, MIDFIELD: 8, ATTACK: 10,NRG: 7, SPD: 10}, position: Position.ATTACK },
  { name: 'THE POSTMAN',ratings: { GKP: 2, DEFENCE: 4, MIDFIELD: 6, ATTACK: 9, NRG: 6, SPD: 7 }, position: Position.ATTACK },
  { name: 'SNIFFER',    ratings: { GKP: 1, DEFENCE: 3, MIDFIELD: 5, ATTACK: 9, NRG: 7, SPD: 8 }, position: Position.ATTACK },
  { name: 'LITTLE JOHN',ratings: { GKP: 1, DEFENCE: 5, MIDFIELD: 6, ATTACK: 8, NRG: 6, SPD: 6 }, position: Position.ATTACK },
  { name: 'GAV',        ratings: { GKP: 3, DEFENCE: 4, MIDFIELD: 7, ATTACK: 8, NRG: 7, SPD: 8 }, position: Position.ATTACK },
];

const GET_RANDOM_16 = (): Player[] => {
  const shuffled = [...FAMOUS_PLAYERS].sort(() => 0.5 - Math.random());
  const defenders = shuffled.filter(p => p.position === Position.DEFENCE).slice(0, 2);
  const midfielders = shuffled.filter(p => p.position === Position.MIDFIELD).slice(0, 2);
  const remaining = shuffled.filter(p => !defenders.includes(p) && !midfielders.includes(p));
  const selected16 = [...defenders, ...midfielders, ...remaining.slice(0, 12)].sort(() => 0.5 - Math.random());
  return selected16.map(p => ({ ...p, id: crypto.randomUUID(), isSelected: true }));
};

// Tap Zone component for MM2
function TapZone({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const SIZE = 14; // px — 40% of original ~34px height
  const GAP = 3;   // px between segments
  return (
    <div className="flex items-center flex-1" style={{ gap: `${GAP}px` }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`flex-shrink-0 ${i < value ? color : 'bg-white/10'}`}
          style={{ width: SIZE, height: SIZE, WebkitTapHighlightColor: 'transparent', border: 'none', padding: 0 }}
        />
      ))}
      {/* invisible spacer pushes segments left */}
      <div className="flex-1" />
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

  const toggleExpanded = (id: string) => {
    setExpandedPlayers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const scrollDelta = currentScrollY - lastScrollY.current;
    if (headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      let newTranslateY = translateY.current - scrollDelta;
      if (currentScrollY <= 0) newTranslateY = 0;
      else newTranslateY = Math.max(-headerHeight, Math.min(0, newTranslateY));
      translateY.current = newTranslateY;
      headerRef.current.style.transform = `translateY(${newTranslateY}px)`;
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
        // Migrate old players that might be missing NRG/SPD
        setPlayers(data.map((p: any) => ({
          ...p,
          ratings: { ...DEFAULT_RATINGS(), ...p.ratings }
        })));
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
      const pos = ([Position.GKP, Position.DEFENCE, Position.MIDFIELD, Position.ATTACK] as Position[])
        .reduce((best, cur) => p.ratings[cur] > p.ratings[best] ? cur : best, Position.GKP);
      return pos;
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
    setPlayers([...players, {
      id: crypto.randomUUID(),
      name: newPlayerName,
      ratings: DEFAULT_RATINGS(),
      position: Position.MIDFIELD,
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

  // MM2 stat definitions with tap zone colours
  const MM2_STATS: { key: StatKey; label: string; textColor: string; fillColor: string }[] = [
    { key: 'NRG',            label: 'NRG', textColor: 'text-white',        fillColor: 'bg-white/60' },
    { key: 'SPD',            label: 'SPD', textColor: 'text-[#f7941d]',    fillColor: 'bg-[#f7941d]' },
    { key: Position.GKP,     label: 'GKP', textColor: 'text-ceefax-green', fillColor: 'bg-ceefax-green' },
    { key: Position.DEFENCE, label: 'DEF', textColor: 'text-ceefax-cyan',  fillColor: 'bg-ceefax-cyan' },
    { key: Position.MIDFIELD,label: 'MID', textColor: 'text-ceefax-red',   fillColor: 'bg-ceefax-red' },
    { key: Position.ATTACK,  label: 'ATT', textColor: 'text-ceefax-yellow',fillColor: 'bg-ceefax-yellow' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] max-w-5xl mx-auto overflow-hidden bg-black text-white font-mono uppercase">
      <main ref={mainRef} className="flex-grow overflow-y-auto relative" onScroll={handleScroll}>
        <header ref={headerRef} className="sticky top-0 z-10 bg-black p-4 pt-8 shrink-0">
          <div className="mb-[11px]">
            <div className="text-ceefax-yellow font-title font-normal text-[50px] tracking-normal uppercase">
              {appMode === 'MM1' ? 'MAN MARKER' : 'MICRO MANAGER'}
            </div>
          </div>
          <div className="flex justify-between items-center text-sm font-bold border-b-4 border-ceefax-cyan pb-2">
            <div className="flex border-2 border-ceefax-white text-sm font-bold">
              <button onClick={() => setAppMode('MM1')} className={`px-3 py-1 tracking-[0.2em] ${appMode === 'MM1' ? 'bg-ceefax-white text-black' : 'bg-black text-ceefax-white'}`}>MM1</button>
              <button onClick={() => setAppMode('MM2')} className={`px-3 py-1 border-l-2 border-ceefax-white tracking-[0.2em] ${appMode === 'MM2' ? 'bg-ceefax-white text-black' : 'bg-black text-ceefax-white'}`}>MM2</button>
            </div>
            {view === 'selection'
              ? <span className="text-ceefax-white">SELECTED {players.filter(x => x.isSelected).length}/{players.length}</span>
              : <span className="text-ceefax-white">PLAYERS: {players.length}</span>
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
                  placeholder="NAME..."
                  className="input-field text-xl uppercase"
                  onKeyDown={e => e.key === 'Enter' && addPlayer()}
                />
                <button onClick={addPlayer} className="px-6 text-xl font-bold border-2 transition-all bg-ceefax-green text-black border-ceefax-green hover:bg-black hover:text-ceefax-green">ADD</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                {players.map((p) => {
                  const isExpanded = expandedPlayers.has(p.id);
                  const overallRating = appMode === 'MM2'
                    ? (Object.values(p.ratings).reduce((a, b) => a + b, 0) / 6).toFixed(1)
                    : p.ratings[p.position];

                  return (
                    <section key={p.id} className="border-b border-gray-800 py-3">

                      {/* MM1 stars */}
                      {appMode === 'MM1' && (
                        <div className="flex justify-end mb-1">
                          <div className="flex text-[20px] leading-none gap-[1px]">
                            {Array.from({ length: 10 }).map((_, idx) => (
                              <span key={idx} className={idx < p.ratings[p.position] ? 'text-ceefax-yellow' : 'text-white/20'}>★</span>
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
                            className="border-2 border-ceefax-yellow p-2 flex-1 text-sm bg-black text-ceefax-white uppercase outline-none font-bold h-[38px]"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingPlayerId(p.id)}
                            className="border-2 border-ceefax-cyan p-2 flex-1 text-sm text-ceefax-white truncate uppercase cursor-text font-bold flex items-center h-[38px]"
                          >
                            {p.name}
                          </div>
                        )}

                        {/* MM1: position toggle */}
                        {appMode === 'MM1' && (
                          <div className="flex border-2 border-ceefax-white overflow-hidden h-[38px] flex-shrink-0 w-[148px]">
                            {([Position.GKP, Position.DEFENCE, Position.MIDFIELD, Position.ATTACK] as Position[]).map((pos, i, arr) => (
                              <button
                                key={pos}
                                onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: pos } : x))}
                                className={`flex-1 text-[10px] font-bold ${i < arr.length - 1 ? 'border-r-2 border-ceefax-white' : ''} ${p.position === pos
                                  ? pos === Position.GKP ? 'bg-ceefax-green text-black'
                                    : pos === Position.DEFENCE ? 'bg-ceefax-cyan text-black'
                                    : pos === Position.MIDFIELD ? 'bg-ceefax-red text-black'
                                    : 'bg-ceefax-yellow text-black'
                                  : 'bg-black text-white/75'}`}
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
                            className="flex items-center gap-2 border-2 border-ceefax-white px-3 h-[38px] flex-shrink-0"
                          >
                            <span className="text-ceefax-yellow font-bold text-sm">{overallRating}</span>
                            <span className="text-white/50 text-xs">{isExpanded ? '▲' : '▼'}</span>
                          </button>
                        )}
                      </div>

                      {/* MM1: slider */}
                      {appMode === 'MM1' && (
                        <div className="flex items-center" style={{ marginTop: '10px' }}>
                          <input
                            type="range" min="1" max="10"
                            value={p.ratings[p.position]}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              setPlayers(players.map(x => x.id === p.id ? { ...x, ratings: { ...x.ratings, [x.position]: val } } : x));
                            }}
                            className="w-full h-1 bg-white/75 appearance-none cursor-pointer"
                          />
                        </div>
                      )}

                      {/* MM2: expanded tap zones */}
                      {appMode === 'MM2' && isExpanded && (
                        <div className="mt-3 space-y-[6px]">
                          {MM2_STATS.map(stat => (
                            <div key={stat.key} className="flex items-center gap-2">
                              <span className={`w-8 text-xs font-bold flex-shrink-0 ${stat.textColor}`}>{stat.label}</span>
                              <TapZone
                                value={p.ratings[stat.key]}
                                onChange={v => updateStat(p.id, stat.key, v)}
                                color={stat.fillColor}
                              />
                              <span className="text-ceefax-yellow font-bold text-sm w-4 text-right flex-shrink-0">{p.ratings[stat.key]}</span>
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
                    className={`p-2 border-2 text-left text-sm transition-all font-bold ${p.isSelected ? 'bg-ceefax-yellow text-black border-ceefax-yellow' : 'bg-black text-ceefax-white border-white/20'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={balanceTeams}
                  className={`w-[300px] border-4 border-ceefax-yellow p-2 text-lg font-bold transition-all ${isGenerating ? 'bg-ceefax-yellow text-black' : 'text-ceefax-yellow bg-black'}`}
                >
                  GENERATE TEAMS
                </button>
              </div>
              {teams && (
                <div className="flex justify-center">
                  <div className="flex w-[300px] border-4 border-ceefax-white text-lg font-bold">
                    <button onClick={() => setShowPlayerDetails(false)} className={`flex-1 p-2 transition-all ${!showPlayerDetails ? 'bg-ceefax-white text-black' : 'bg-black text-ceefax-white'}`}>HIDE INFO</button>
                    <button onClick={() => setShowPlayerDetails(true)} className={`flex-1 p-2 transition-all ${showPlayerDetails ? 'bg-ceefax-white text-black' : 'bg-black text-ceefax-white'}`}>SHOW INFO</button>
                  </div>
                </div>
              )}
              {teams && (
                <div ref={teamsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {[
                    { data: teams.team1, color: 'text-ceefax-cyan', border: 'border-ceefax-cyan' },
                    { data: teams.team2, color: 'text-ceefax-red', border: 'border-ceefax-red' }
                  ].map(t => (
                    <div key={t.data.name} className={`border-4 ${t.border} p-4`}>
                      <div className="flex items-end border-b-2 border-white mb-4 pb-2">
                        <h3 className={`flex-1 text-2xl font-bold truncate pr-2 ${t.color}`}>{t.data.name}</h3>
                        {showPlayerDetails && (
                          <>
                            <span className="w-12 md:w-16 text-white text-sm md:text-xl font-bold">RTG</span>
                            <span className="w-8 md:w-10 text-ceefax-yellow text-sm md:text-xl font-bold">{t.data.totalRating % 1 === 0 ? t.data.totalRating : t.data.totalRating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                      {t.data.players.map(p => (
                        <div key={p.id} className="flex text-sm md:text-xl">
                          <span className="flex-1 truncate pr-2">{p.name}</span>
                          {showPlayerDetails && (
                            <>
                              <span className="w-12 md:w-16 text-white">{getEffectivePosition(p).substring(0, 3)}</span>
                              <span className="w-8 md:w-10 text-ceefax-yellow">{getEffectiveRating(p) % 1 === 0 ? getEffectiveRating(p) : getEffectiveRating(p).toFixed(1)}</span>
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
                    className={`w-[300px] border-4 border-ceefax-white p-2 text-lg font-bold transition-all ${isSharing ? 'bg-ceefax-white text-black' : 'text-ceefax-white bg-black'}`}
                  >
                    SHARE TEAMS
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENT VIEW ── */}
          {view === 'payment' && (
            <div className="border-4 border-ceefax-yellow p-6 space-y-6 bg-black mb-12">
              <h2 className="text-3xl text-ceefax-yellow font-bold text-center">SECURE PAYMENT</h2>
              <div className="border-2 border-ceefax-cyan p-4 text-center">
                <p className="text-ceefax-white text-sm mb-1">ITEM: GAFFER 2.0 LICENSE</p>
                <p className="text-ceefax-green text-xl font-bold">PRICE: £1.99</p>
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
              <button onClick={handlePurchase} className="w-full bg-ceefax-cyan text-black py-2 text-lg font-bold border-4 border-ceefax-cyan hover:bg-black hover:text-ceefax-cyan transition-all">SIMULATE PAYMENT (DEV TEST)</button>
              <button onClick={() => setView('squad')} className="w-full text-ceefax-red text-center underline pt-4">CANCEL</button>
            </div>
          )}

        </div>
      </main>

      <div className="shrink-0 bg-black p-4 flex flex-col gap-4">
        <nav className="flex w-full font-bold text-sm gap-4">
          <button onClick={() => setView('squad')} className={`flex-1 py-2 transition-all border-4 border-ceefax-cyan ${view === 'squad' ? 'bg-ceefax-cyan text-black' : 'bg-black text-ceefax-cyan'}`}>SQUAD</button>
          <button onClick={() => setView('selection')} className={`flex-1 py-2 transition-all border-4 border-ceefax-red ${view === 'selection' ? 'bg-ceefax-red text-black' : 'bg-black text-ceefax-red'}`}>GAFFER</button>
        </nav>
        <div className="text-center text-xs font-normal text-white bg-black normal-case">Copyright - Gary Neill Limited</div>
      </div>
    </div>
  );
}
