import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

enum Position { GKP = 'GKP', DEFENCE = 'DEFENCE', MIDFIELD = 'MIDFIELD', ATTACK = 'ATTACK' }
interface Player { id: string; name: string; ratings: Record<Position, number>; position: Position; isSelected: boolean; nrg?: number; }
interface Team { name: string; players: Player[]; totalRating: number; positions: Record<Position, number>; }

const TEAM_NAMES = [
  'UNITED', 'CITY', 'TOWN', 'ROVERS', 'ATHLETIC', 'WANDERERS',
  'RANGERS', 'COUNTY', 'ALBION', 'VILLA', 'ALEXANDRA', 'ORIENT',
  'BOROUGH', 'ACADEMICAL', 'FOREST', 'WEDNESDAY', 'PARK', 'VALE'
];

const FAMOUS_PLAYERS = [
  { name: 'THE CAT', ratings: { [Position.GKP]: 9, [Position.DEFENCE]: 4, [Position.MIDFIELD]: 3, [Position.ATTACK]: 2 }, position: Position.GKP },
  { name: 'SIMMO', ratings: { [Position.GKP]: 8, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 4, [Position.ATTACK]: 3 }, position: Position.GKP },
  { name: 'CHOPPER', ratings: { [Position.GKP]: 3, [Position.DEFENCE]: 10, [Position.MIDFIELD]: 6, [Position.ATTACK]: 4 }, position: Position.DEFENCE },
  { name: 'BIG JOHN', ratings: { [Position.GKP]: 4, [Position.DEFENCE]: 9, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5 }, position: Position.DEFENCE },
  { name: 'FRANCO', ratings: { [Position.GKP]: 2, [Position.DEFENCE]: 9, [Position.MIDFIELD]: 7, [Position.ATTACK]: 4 }, position: Position.DEFENCE },
  { name: 'BARRY', ratings: { [Position.GKP]: 5, [Position.DEFENCE]: 8, [Position.MIDFIELD]: 4, [Position.ATTACK]: 3 }, position: Position.DEFENCE },
  { name: 'BONES', ratings: { [Position.GKP]: 1, [Position.DEFENCE]: 8, [Position.MIDFIELD]: 6, [Position.ATTACK]: 2 }, position: Position.DEFENCE },
  { name: 'LUNGS', ratings: { [Position.GKP]: 2, [Position.DEFENCE]: 7, [Position.MIDFIELD]: 10, [Position.ATTACK]: 7 }, position: Position.MIDFIELD },
  { name: 'TRICKY PETE', ratings: { [Position.GKP]: 1, [Position.DEFENCE]: 4, [Position.MIDFIELD]: 9, [Position.ATTACK]: 8 }, position: Position.MIDFIELD },
  { name: 'WOR DAVE', ratings: { [Position.GKP]: 3, [Position.DEFENCE]: 6, [Position.MIDFIELD]: 9, [Position.ATTACK]: 6 }, position: Position.MIDFIELD },
  { name: 'GADGET', ratings: { [Position.GKP]: 4, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 8, [Position.ATTACK]: 7 }, position: Position.MIDFIELD },
  { name: 'SWEATY', ratings: { [Position.GKP]: 2, [Position.DEFENCE]: 8, [Position.MIDFIELD]: 8, [Position.ATTACK]: 5 }, position: Position.MIDFIELD },
  { name: 'BOBBY SCORE', ratings: { [Position.GKP]: 1, [Position.DEFENCE]: 3, [Position.MIDFIELD]: 7, [Position.ATTACK]: 10 }, position: Position.ATTACK },
  { name: 'GAZADONNA', ratings: { [Position.GKP]: 1, [Position.DEFENCE]: 2, [Position.MIDFIELD]: 8, [Position.ATTACK]: 10 }, position: Position.ATTACK },
  { name: 'THE POSTMAN', ratings: { [Position.GKP]: 2, [Position.DEFENCE]: 4, [Position.MIDFIELD]: 6, [Position.ATTACK]: 9 }, position: Position.ATTACK },
  { name: 'SNIFFER', ratings: { [Position.GKP]: 1, [Position.DEFENCE]: 3, [Position.MIDFIELD]: 5, [Position.ATTACK]: 9 }, position: Position.ATTACK },
  { name: 'LITTLE JOHN', ratings: { [Position.GKP]: 1, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 6, [Position.ATTACK]: 8 }, position: Position.ATTACK },
  { name: 'GAV', ratings: { [Position.GKP]: 3, [Position.DEFENCE]: 4, [Position.MIDFIELD]: 7, [Position.ATTACK]: 8 }, position: Position.ATTACK },
];

const GET_RANDOM_16 = (): Player[] => {
  const shuffled = [...FAMOUS_PLAYERS].sort(() => 0.5 - Math.random());
  
  // Ensure at least 2 defenders and 2 midfielders
  const defenders = shuffled.filter(p => p.position === Position.DEFENCE).slice(0, 2);
  const midfielders = shuffled.filter(p => p.position === Position.MIDFIELD).slice(0, 2);
  
  // Fill the rest up to 16 players
  const remaining = shuffled.filter(p => !defenders.includes(p) && !midfielders.includes(p));
  const selected16 = [...defenders, ...midfielders, ...remaining.slice(0, 12)].sort(() => 0.5 - Math.random());

  return selected16.map(p => ({
    ...p,
    id: crypto.randomUUID(),
    isSelected: true
  }));
};

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [view, setView] = useState<'selection' | 'squad' | 'payment'>('squad');
  const [appMode, setAppMode] = useState<'MM1' | 'MM2'>('MM1');
  const [teams, setTeams] = useState<{ team1: Team; team2: Team } | null>(null);
  const [squadId, setSquadId] = useState<string | null>(() => {
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
  const [showPlayerDetails, setShowPlayerDetails] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const translateY = useRef(0);
  const teamsContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const scrollDelta = currentScrollY - lastScrollY.current;
    
    if (headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      let newTranslateY = translateY.current - scrollDelta;
      
      if (currentScrollY <= 0) {
        newTranslateY = 0;
      } else {
        newTranslateY = Math.max(-headerHeight, Math.min(0, newTranslateY));
      }
      
      translateY.current = newTranslateY;
      headerRef.current.style.transform = `translateY(${newTranslateY}px)`;
    }
    
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (headerRef.current) {
      translateY.current = 0;
      headerRef.current.style.transform = `translateY(0px)`;
    }
  }, [appMode, view]);

  useEffect(() => {
    if (!squadId) return;
    fetch(`/api/squad-status/${squadId}`).then(r => r.json()).then(setSquadStatus);
    fetch(`/api/players/${squadId}`).then(r => r.json()).then(data => {
      if (data.length > 0) setPlayers(data);
      else setPlayers(GET_RANDOM_16());
    });
  }, [squadId]);

  useEffect(() => {
    if (!squadId || players.length === 0) return;
    const timer = setTimeout(() => {
      fetch(`/api/players/${squadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(players)
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [players, squadId]);

  const getEffectivePosition = (p: Player) => {
    if (appMode === 'MM2' && p.ratings) {
      let maxPos = Position.GKP;
      let maxVal = p.ratings[Position.GKP];
      if (p.ratings[Position.DEFENCE] >= maxVal) { maxPos = Position.DEFENCE; maxVal = p.ratings[Position.DEFENCE]; }
      if (p.ratings[Position.MIDFIELD] >= maxVal) { maxPos = Position.MIDFIELD; maxVal = p.ratings[Position.MIDFIELD]; }
      if (p.ratings[Position.ATTACK] >= maxVal) { maxPos = Position.ATTACK; maxVal = p.ratings[Position.ATTACK]; }
      return maxPos;
    }
    return p.position;
  };

  const getEffectiveRating = (p: Player) => {
    if (appMode === 'MM2' && p.ratings) {
      return (p.ratings[Position.GKP] + p.ratings[Position.DEFENCE] + p.ratings[Position.MIDFIELD] + p.ratings[Position.ATTACK] + (p.nrg || 5)) / 5;
    }
    return p.ratings ? p.ratings[p.position] : ((p as any).rating || 5);
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
      const posPlayers = selected.filter(p => getEffectivePosition(p) === pos).sort((a, b) => {
        return getEffectiveRating(b) - getEffectiveRating(a);
      });
      for (let i = 0; i < posPlayers.length; i += 2) {
        const p1 = posPlayers[i];
        const p2 = posPlayers[i + 1];
        
        if (p2) {
          const t1Rating = t1.reduce((sum, p) => sum + getEffectiveRating(p), 0);
          const t2Rating = t2.reduce((sum, p) => sum + getEffectiveRating(p), 0);

          if (t1.length < t2.length) {
            t1.push(p1); t2.push(p2);
          } else if (t2.length < t1.length) {
            t2.push(p1); t1.push(p2);
          } else {
            if (t1Rating < t2Rating) {
              t1.push(p1); t2.push(p2);
            } else if (t2Rating < t1Rating) {
              t2.push(p1); t1.push(p2);
            } else {
              if (Math.random() > 0.5) {
                t1.push(p1); t2.push(p2);
              } else {
                t1.push(p2); t2.push(p1);
              }
            }
          }
        } else {
          leftovers.push(p1);
        }
      }
    });

    leftovers.sort((a, b) => {
      return getEffectiveRating(b) - getEffectiveRating(a);
    });
    leftovers.forEach(p => {
      const t1Rating = t1.reduce((sum, player) => sum + getEffectiveRating(player), 0);
      const t2Rating = t2.reduce((sum, player) => sum + getEffectiveRating(player), 0);
      
      if (t1.length < t2.length) {
        t1.push(p);
      } else if (t2.length < t1.length) {
        t2.push(p);
      } else if (t1Rating <= t2Rating) {
        t1.push(p);
      } else {
        t2.push(p);
      }
    });

    const sortOrder = { [Position.GKP]: 0, [Position.DEFENCE]: 1, [Position.MIDFIELD]: 2, [Position.ATTACK]: 3 };
    const sortPlayers = (ps: Player[]) => [...ps].sort((a, b) => {
      return sortOrder[getEffectivePosition(a)] - sortOrder[getEffectivePosition(b)] || getEffectiveRating(b) - getEffectiveRating(a);
    });

    const shuffledNames = [...TEAM_NAMES].sort(() => 0.5 - Math.random());

    const createTeam = (name: string, ps: Player[]): Team => ({
      name,
      players: sortPlayers(ps),
      totalRating: ps.reduce((s, p) => s + getEffectiveRating(p), 0),
      positions: {
        [Position.GKP]: ps.filter(x => getEffectivePosition(x) === Position.GKP).length,
        [Position.DEFENCE]: ps.filter(x => getEffectivePosition(x) === Position.DEFENCE).length,
        [Position.MIDFIELD]: ps.filter(x => getEffectivePosition(x) === Position.MIDFIELD).length,
        [Position.ATTACK]: ps.filter(x => getEffectivePosition(x) === Position.ATTACK).length
      }
    });

    setTeams({ team1: createTeam(shuffledNames[0], t1), team2: createTeam(shuffledNames[1], t2) });
    
    // Auto-scroll to teams after a brief delay to allow rendering
    setTimeout(() => {
      teamsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePurchase = async () => {
    if (!squadId) return;
    await fetch(`/api/purchase/${squadId}`, { method: 'POST' });
    const status = await fetch(`/api/squad-status/${squadId}`).then(r => r.json());
    setSquadStatus(status);
    setView('squad');
  };

  const resetSquad = () => {
    const newId = Math.floor(100 + Math.random() * 900).toString();
    localStorage.setItem('ceefax_squad_id', newId);
    setSquadId(newId);
    setTeams(null);
    setView('squad');
  };

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
              <button 
                onClick={() => setAppMode('MM1')} 
                className={`px-3 py-1 tracking-[0.2em] ${appMode === 'MM1' ? 'bg-ceefax-white text-black' : 'bg-black text-ceefax-white'}`}
              >
                MM1
              </button>
              <button 
                onClick={() => setAppMode('MM2')} 
                className={`px-3 py-1 border-l-2 border-ceefax-white tracking-[0.2em] ${appMode === 'MM2' ? 'bg-ceefax-white text-black' : 'bg-black text-ceefax-white'}`}
              >
                MM2
              </button>
            </div>
            {view === 'selection' ? (
              <span className="text-ceefax-white">SELECTED {players.filter(x => x.isSelected).length}/{players.length}</span>
            ) : (
              <span className="text-ceefax-white">PLAYERS: {players.length}</span>
            )}
          </div>
        </header>

        <div className="p-4 space-y-6">
          {view === 'squad' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <input 
                value={newPlayerName} 
                onChange={e => setNewPlayerName(e.target.value.toUpperCase())} 
                placeholder="NAME..." 
                className="input-field text-xl uppercase" 
                onKeyDown={e => e.key === 'Enter' && newPlayerName && (setPlayers([...players, { id: crypto.randomUUID(), name: newPlayerName, ratings: { [Position.GKP]: 5, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5 }, position: Position.MIDFIELD, isSelected: true }]), setNewPlayerName(''))}
              />
              <button 
                onClick={() => { if (newPlayerName) { setPlayers([...players, { id: crypto.randomUUID(), name: newPlayerName, ratings: { [Position.GKP]: 5, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5 }, position: Position.MIDFIELD, isSelected: true }]); setNewPlayerName(''); } }} 
                className="px-6 text-xl font-bold border-2 transition-all bg-ceefax-green text-black border-ceefax-green hover:bg-black hover:text-ceefax-green"
              >
                ADD
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {players.map((p, i) => {
                const rGKP = p.ratings ? p.ratings[Position.GKP] : ((p as any).rating || 5);
                const rDEF = p.ratings ? p.ratings[Position.DEFENCE] : ((p as any).rating || 5);
                const rMID = p.ratings ? p.ratings[Position.MIDFIELD] : ((p as any).rating || 5);
                const rATT = p.ratings ? p.ratings[Position.ATTACK] : ((p as any).rating || 5);

                let maxPos = Position.GKP;
                let maxVal = rGKP;
                if (rDEF >= maxVal) { maxPos = Position.DEFENCE; maxVal = rDEF; }
                if (rMID >= maxVal) { maxPos = Position.MIDFIELD; maxVal = rMID; }
                if (rATT >= maxVal) { maxPos = Position.ATTACK; maxVal = rATT; }

                return (
                <section key={p.id} className="space-y-2 border-b border-gray-800 pb-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-ceefax-cyan font-bold uppercase">PLAYER {i + 1}</h2>
                    {appMode === 'MM1' && (
                      <div className="flex gap-0.5 text-ceefax-yellow">
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <span key={idx} className={idx < (p.ratings ? p.ratings[p.position] : ((p as any).rating || 5)) ? "text-ceefax-yellow" : "text-gray-500"}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-start">
                      <div className="flex flex-col flex-grow justify-between self-stretch">
                        {editingPlayerId === p.id ? (
                          <input 
                            autoFocus 
                            value={p.name} 
                            onBlur={() => setEditingPlayerId(null)} 
                            onKeyDown={e => e.key === 'Enter' && setEditingPlayerId(null)}
                            onChange={e => setPlayers(players.map(x => x.id === p.id ? { ...x, name: e.target.value.toUpperCase() } : x))} 
                            className="border-2 border-ceefax-yellow p-2 w-full text-sm bg-black text-ceefax-white uppercase outline-none font-bold h-[38px]" 
                          />
                        ) : (
                          <div 
                            onClick={() => setEditingPlayerId(p.id)} 
                            className="border-2 border-ceefax-cyan p-2 w-full text-sm text-ceefax-white truncate uppercase cursor-text font-bold flex items-center h-[38px]"
                          >
                            {p.name}
                          </div>
                        )}
                        
                        {appMode === 'MM2' && (
                          <div className="flex items-center gap-3 h-[28px] px-1">
                            <span className="text-ceefax-white font-normal text-sm leading-none">NRG</span>
                            <input 
                              type="range" 
                              min="1" max="10" 
                              value={p.nrg || 5} 
                              onChange={e => {
                                const val = parseInt(e.target.value);
                                setPlayers(players.map(x => x.id === p.id ? { ...x, nrg: val } : x));
                              }}
                              className="w-full accent-ceefax-yellow h-1 bg-ceefax-yellow/50 appearance-none cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                      
                      {appMode === 'MM1' ? (
                        <div className="flex border-2 border-ceefax-white overflow-hidden h-[38px] flex-shrink-0 w-40 md:w-48">
                          <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.GKP } : x))} className={`flex-1 px-1 py-1 text-[10px] md:text-xs font-bold ${p.position === Position.GKP || p.position === Position.DEFENCE ? 'border-r-2 border-ceefax-white' : ''} ${p.position === Position.GKP ? 'bg-ceefax-green text-black' : 'bg-black text-gray-500'}`}>GKP</button>
                          <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.DEFENCE } : x))} className={`flex-1 px-1 py-1 text-[10px] md:text-xs font-bold ${p.position === Position.DEFENCE || p.position === Position.MIDFIELD ? 'border-r-2 border-ceefax-white' : ''} ${p.position === Position.DEFENCE ? 'bg-ceefax-cyan text-black' : 'bg-black text-gray-500'}`}>DEF</button>
                          <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.MIDFIELD } : x))} className={`flex-1 px-1 py-1 text-[10px] md:text-xs font-bold ${p.position === Position.MIDFIELD || p.position === Position.ATTACK ? 'border-r-2 border-ceefax-white' : ''} ${p.position === Position.MIDFIELD ? 'bg-ceefax-red text-black' : 'bg-black text-gray-500'}`}>MID</button>
                          <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.ATTACK } : x))} className={`flex-1 px-1 py-1 text-[10px] md:text-xs font-bold ${p.position === Position.ATTACK ? 'bg-ceefax-yellow text-black' : 'bg-black text-gray-500'}`}>ATT</button>
                        </div>
                      ) : (
                        <div className="flex flex-col border-2 border-ceefax-white overflow-hidden flex-shrink-0 w-40 md:w-48">
                          <div className="flex h-[34px] border-b-2 border-ceefax-white">
                            <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.GKP } : x))} className={`flex-1 px-1 py-1 text-[10px] md:text-xs font-bold ${maxPos === Position.GKP || maxPos === Position.DEFENCE ? 'border-r-2 border-ceefax-white' : ''} ${maxPos === Position.GKP ? 'bg-ceefax-green text-black' : 'bg-black text-gray-500'}`}>GKP</button>
                            <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.DEFENCE } : x))} className={`flex-1 px-1 py-1 text-[10px] md:text-xs font-bold ${maxPos === Position.DEFENCE || maxPos === Position.MIDFIELD ? 'border-r-2 border-ceefax-white' : ''} ${maxPos === Position.DEFENCE ? 'bg-ceefax-cyan text-black' : 'bg-black text-gray-500'}`}>DEF</button>
                            <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.MIDFIELD } : x))} className={`flex-1 px-1 py-1 text-[10px] md:text-xs font-bold ${maxPos === Position.MIDFIELD || maxPos === Position.ATTACK ? 'border-r-2 border-ceefax-white' : ''} ${maxPos === Position.MIDFIELD ? 'bg-ceefax-red text-black' : 'bg-black text-gray-500'}`}>MID</button>
                            <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.ATTACK } : x))} className={`flex-1 px-1 py-1 text-[10px] md:text-xs font-bold ${maxPos === Position.ATTACK ? 'bg-ceefax-yellow text-black' : 'bg-black text-gray-500'}`}>ATT</button>
                          </div>
                          <div className="flex h-[36px]">
                            <input type="number" min="1" max="10" onFocus={e => e.target.select()} value={p.ratings ? p.ratings[Position.GKP] : ((p as any).rating || 5)} onChange={e => { const rawVal = parseInt(e.target.value); const val = isNaN(rawVal) ? '' : Math.max(1, Math.min(10, rawVal)); setPlayers(players.map(x => x.id === p.id ? { ...x, ratings: { ...(x.ratings || { [Position.GKP]: 5, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5 }), [Position.GKP]: val as number } } : x)); }} className={`flex-1 w-0 text-center font-bold text-sm outline-none hide-spinners ${maxPos === Position.GKP || maxPos === Position.DEFENCE ? 'border-r-2 border-ceefax-white' : ''} ${maxPos === Position.GKP ? 'bg-ceefax-green text-black' : 'bg-black text-gray-500'}`} />
                            <input type="number" min="1" max="10" onFocus={e => e.target.select()} value={p.ratings ? p.ratings[Position.DEFENCE] : ((p as any).rating || 5)} onChange={e => { const rawVal = parseInt(e.target.value); const val = isNaN(rawVal) ? '' : Math.max(1, Math.min(10, rawVal)); setPlayers(players.map(x => x.id === p.id ? { ...x, ratings: { ...(x.ratings || { [Position.GKP]: 5, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5 }), [Position.DEFENCE]: val as number } } : x)); }} className={`flex-1 w-0 text-center font-bold text-sm outline-none hide-spinners ${maxPos === Position.DEFENCE || maxPos === Position.MIDFIELD ? 'border-r-2 border-ceefax-white' : ''} ${maxPos === Position.DEFENCE ? 'bg-ceefax-cyan text-black' : 'bg-black text-gray-500'}`} />
                            <input type="number" min="1" max="10" onFocus={e => e.target.select()} value={p.ratings ? p.ratings[Position.MIDFIELD] : ((p as any).rating || 5)} onChange={e => { const rawVal = parseInt(e.target.value); const val = isNaN(rawVal) ? '' : Math.max(1, Math.min(10, rawVal)); setPlayers(players.map(x => x.id === p.id ? { ...x, ratings: { ...(x.ratings || { [Position.GKP]: 5, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5 }), [Position.MIDFIELD]: val as number } } : x)); }} className={`flex-1 w-0 text-center font-bold text-sm outline-none hide-spinners ${maxPos === Position.MIDFIELD || maxPos === Position.ATTACK ? 'border-r-2 border-ceefax-white' : ''} ${maxPos === Position.MIDFIELD ? 'bg-ceefax-red text-black' : 'bg-black text-gray-500'}`} />
                            <input type="number" min="1" max="10" onFocus={e => e.target.select()} value={p.ratings ? p.ratings[Position.ATTACK] : ((p as any).rating || 5)} onChange={e => { const rawVal = parseInt(e.target.value); const val = isNaN(rawVal) ? '' : Math.max(1, Math.min(10, rawVal)); setPlayers(players.map(x => x.id === p.id ? { ...x, ratings: { ...(x.ratings || { [Position.GKP]: 5, [Position.DEFENCE]: 5, [Position.MIDFIELD]: 5, [Position.ATTACK]: 5 }), [Position.ATTACK]: val as number } } : x)); }} className={`flex-1 w-0 text-center font-bold text-sm outline-none hide-spinners ${maxPos === Position.ATTACK ? 'bg-ceefax-yellow text-black' : 'bg-black text-gray-500'}`} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {appMode === 'MM1' && (
                      <div className="flex mt-2 items-center">
                        <input 
                          type="range" 
                          min="1" max="10" 
                          value={p.ratings ? p.ratings[p.position] : ((p as any).rating || 5)} 
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setPlayers(players.map(x => x.id === p.id ? { ...x, ratings: { [Position.GKP]: val, [Position.DEFENCE]: val, [Position.MIDFIELD]: val, [Position.ATTACK]: val } } : x));
                          }}
                          className="w-full accent-ceefax-yellow h-1 bg-ceefax-yellow/50 appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </section>
                );
              })}
            </div>
          </div>
          )}

        {view === 'selection' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {players.map(p => (
                <button key={p.id} onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, isSelected: !x.isSelected } : x))} className={`p-2 border-2 text-left text-sm transition-all font-bold ${p.isSelected ? 'bg-ceefax-yellow text-black border-ceefax-yellow' : 'bg-black text-ceefax-white border-white/20'}`}>{p.name}</button>
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
              <div ref={teamsContainerRef} className="flex justify-center mt-4">
                <div className="flex w-[300px] border-4 border-ceefax-white text-lg font-bold">
                  <button 
                    onClick={() => setShowPlayerDetails(false)}
                    className={`flex-1 p-2 transition-all ${!showPlayerDetails ? 'bg-ceefax-white text-black' : 'bg-black text-ceefax-white'}`}
                  >
                    HIDE INFO
                  </button>
                  <button 
                    onClick={() => setShowPlayerDetails(true)}
                    className={`flex-1 p-2 transition-all ${showPlayerDetails ? 'bg-ceefax-white text-black' : 'bg-black text-ceefax-white'}`}
                  >
                    SHOW INFO
                  </button>
                </div>
              </div>
            )}
            {teams && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {[
                  { data: teams.team1, color: 'text-ceefax-cyan', border: 'border-ceefax-cyan' },
                  { data: teams.team2, color: 'text-ceefax-red', border: 'border-ceefax-red' }
                ].map(t => (
                  <div key={t.data.name} className={`border-4 ${t.border} p-4`}>
                    <div className="flex items-end border-b-2 border-white mb-4 pb-2 text-left">
                      <h3 className={`flex-1 text-2xl font-bold truncate pr-2 ${t.color}`}>{t.data.name}</h3>
                      {showPlayerDetails && (
                        <>
                          <span className="w-12 md:w-16 text-white text-sm md:text-xl font-bold">RTG</span>
                          <span className="w-8 md:w-10 text-ceefax-yellow text-sm md:text-xl font-bold">{t.data.totalRating % 1 === 0 ? t.data.totalRating : t.data.totalRating.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                    {t.data.players.map(p => (
                      <div key={p.id} className="flex text-sm md:text-xl text-left">
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
          </div>
        )}

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
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          description: "GAFFER 2.0 License",
                          amount: {
                            currency_code: "GBP",
                            value: "1.99",
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      await actions.order.capture();
                      await handlePurchase();
                    }
                  }}
                  style={{ layout: "vertical", color: "gold", shape: "rect" }}
                />
              </PayPalScriptProvider>
            </div>

            <button onClick={handlePurchase} className="w-full bg-ceefax-cyan text-black py-2 text-lg font-bold border-4 border-ceefax-cyan hover:bg-black hover:text-ceefax-cyan transition-all">
              SIMULATE PAYMENT (DEV TEST)
            </button>

            <button onClick={() => setView('squad')} className="w-full text-ceefax-red text-center underline pt-4">CANCEL</button>
          </div>
        )}
        </div>
      </main>

      <div className="shrink-0 bg-black p-4 flex flex-col gap-4">
        <nav className="flex w-full font-bold text-sm gap-4">
          <button 
            onClick={() => setView('squad')} 
            className={`flex-1 py-2 transition-all border-4 border-ceefax-cyan ${view === 'squad' ? 'bg-ceefax-cyan text-black' : 'bg-black text-ceefax-cyan'}`}
          >
            SQUAD
          </button>
          <button 
            onClick={() => setView('selection')} 
            className={`flex-1 py-2 transition-all border-4 border-ceefax-red ${view === 'selection' ? 'bg-ceefax-red text-black' : 'bg-black text-ceefax-red'}`}
          >
            GAFFER
          </button>
        </nav>
        {(!squadStatus || squadStatus.is_licensed === 0) && (
          <button 
            onClick={() => setView('payment')} 
            className="w-full bg-ceefax-yellow text-black py-2 font-bold text-sm uppercase border-4 border-ceefax-yellow overflow-hidden relative block text-left"
          >
            <span className="animate-marquee whitespace-nowrap">
              &gt; 10 DAY TRIAL &lt; &nbsp;&nbsp;&nbsp;&nbsp; &gt; MAN MARKER - ANNUAL LICENCE - £1.99 &lt; &nbsp;&nbsp;&nbsp;&nbsp; &gt; MICRO MANAGER - ANNUAL LICENCE - £3.99 &lt;
            </span>
          </button>
        )}
        <div className="text-center text-xs font-normal text-white bg-black normal-case">
          Copyright - Gary Neill Limited
        </div>
      </div>
    </div>
  );
}
