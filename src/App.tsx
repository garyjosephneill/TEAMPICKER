import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

enum Position { DEFENCE = 'DEFENCE', MIDFIELD = 'MIDFIELD', ATTACK = 'ATTACK' }
interface Player { id: string; name: string; rating: number; position: Position; isSelected: boolean; }
interface Team { name: string; players: Player[]; totalRating: number; positions: Record<Position, number>; }

const TEAM_NAMES = [
  'UNITED', 'CITY', 'TOWN', 'ROVERS', 'ATHLETIC', 'WANDERERS',
  'RANGERS', 'COUNTY', 'ALBION', 'VILLA', 'ALEXANDRA', 'ORIENT',
  'BOROUGH', 'ACADEMICAL', 'FOREST', 'WEDNESDAY', 'PARK', 'VALE'
];

const BALLON_DOR_WINNERS = [
  { name: 'LIONEL MESSI', rating: 10, position: Position.ATTACK },
  { name: 'CRISTIANO RONALDO', rating: 10, position: Position.ATTACK },
  { name: 'LUKA MODRIC', rating: 9, position: Position.MIDFIELD },
  { name: 'KAKA', rating: 9, position: Position.MIDFIELD },
  { name: 'FABIO CANNAVARO', rating: 9, position: Position.DEFENCE },
  { name: 'RONALDINHO', rating: 10, position: Position.ATTACK },
  { name: 'ANDRIY SHEVCHENKO', rating: 9, position: Position.ATTACK },
  { name: 'PAVEL NEDVED', rating: 9, position: Position.MIDFIELD },
  { name: 'RONALDO', rating: 10, position: Position.ATTACK },
  { name: 'MICHAEL OWEN', rating: 9, position: Position.ATTACK },
  { name: 'LUIS FIGO', rating: 9, position: Position.MIDFIELD },
  { name: 'RIVALDO', rating: 9, position: Position.ATTACK },
  { name: 'ZINEDINE ZIDANE', rating: 10, position: Position.MIDFIELD },
  { name: 'MARCO VAN BASTEN', rating: 10, position: Position.ATTACK },
  { name: 'RUUD GULLIT', rating: 9, position: Position.MIDFIELD },
  { name: 'MICHEL PLATINI', rating: 10, position: Position.MIDFIELD },
  { name: 'PAOLO ROSSI', rating: 9, position: Position.ATTACK },
  { name: 'KEVIN KEEGAN', rating: 9, position: Position.ATTACK },
  { name: 'ALLAN SIMONSEN', rating: 8, position: Position.ATTACK },
  { name: 'FRANZ BECKENBAUER', rating: 10, position: Position.DEFENCE },
  { name: 'OLEG BLOKHIN', rating: 9, position: Position.ATTACK },
  { name: 'JOHAN CRUYFF', rating: 10, position: Position.ATTACK },
  { name: 'GERD MULLER', rating: 10, position: Position.ATTACK },
  { name: 'GIANNI RIVERA', rating: 9, position: Position.MIDFIELD },
  { name: 'GEORGE BEST', rating: 10, position: Position.ATTACK },
  { name: 'BOBBY CHARLTON', rating: 9, position: Position.MIDFIELD },
  { name: 'EUSEBIO', rating: 10, position: Position.ATTACK },
  { name: 'DENIS LAW', rating: 9, position: Position.ATTACK },
  { name: 'LEV YASHIN', rating: 10, position: Position.DEFENCE },
];

const GET_RANDOM_12 = (): Player[] => {
  const shuffled = [...BALLON_DOR_WINNERS].sort(() => 0.5 - Math.random());
  
  // Ensure at least 2 defenders and 2 midfielders
  const defenders = shuffled.filter(p => p.position === Position.DEFENCE).slice(0, 2);
  const midfielders = shuffled.filter(p => p.position === Position.MIDFIELD).slice(0, 2);
  
  // Fill the rest up to 14 players
  const remaining = shuffled.filter(p => !defenders.includes(p) && !midfielders.includes(p));
  const selected14 = [...defenders, ...midfielders, ...remaining.slice(0, 10)].sort(() => 0.5 - Math.random());

  return selected14.map(p => ({
    ...p,
    rating: Math.floor(Math.random() * 5) + 6, // Random rating between 6 and 10
    id: crypto.randomUUID(),
    isSelected: false
  }));
};

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [view, setView] = useState<'selection' | 'squad' | 'payment'>('squad');
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

  useEffect(() => {
    if (!squadId) return;
    fetch(`/api/squad-status/${squadId}`).then(r => r.json()).then(setSquadStatus);
    fetch(`/api/players/${squadId}`).then(r => r.json()).then(data => {
      if (data.length > 0) setPlayers(data);
      else setPlayers(GET_RANDOM_12());
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

  const balanceTeams = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1000);

    const selected = players.filter(p => p.isSelected);
    if (selected.length < 2) return;
    
    const t1: Player[] = [], t2: Player[] = [];
    
    const positions = [Position.DEFENCE, Position.MIDFIELD, Position.ATTACK];
    const leftovers: Player[] = [];
    
    positions.forEach(pos => {
      const posPlayers = selected.filter(p => p.position === pos).sort((a, b) => b.rating - a.rating);
      for (let i = 0; i < posPlayers.length; i += 2) {
        const p1 = posPlayers[i];
        const p2 = posPlayers[i + 1];
        
        if (p2) {
          const t1Rating = t1.reduce((sum, p) => sum + p.rating, 0);
          const t2Rating = t2.reduce((sum, p) => sum + p.rating, 0);

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

    leftovers.sort((a, b) => b.rating - a.rating);
    leftovers.forEach(p => {
      const t1Rating = t1.reduce((sum, player) => sum + player.rating, 0);
      const t2Rating = t2.reduce((sum, player) => sum + player.rating, 0);
      
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

    const sortOrder = { [Position.DEFENCE]: 1, [Position.MIDFIELD]: 2, [Position.ATTACK]: 3 };
    const sortPlayers = (ps: Player[]) => [...ps].sort((a, b) => sortOrder[a.position] - sortOrder[b.position] || b.rating - a.rating);

    const shuffledNames = [...TEAM_NAMES].sort(() => 0.5 - Math.random());

    const createTeam = (name: string, ps: Player[]): Team => ({
      name,
      players: sortPlayers(ps),
      totalRating: ps.reduce((s, p) => s + p.rating, 0),
      positions: {
        [Position.DEFENCE]: ps.filter(x => x.position === Position.DEFENCE).length,
        [Position.MIDFIELD]: ps.filter(x => x.position === Position.MIDFIELD).length,
        [Position.ATTACK]: ps.filter(x => x.position === Position.ATTACK).length
      }
    });

    setTeams({ team1: createTeam(shuffledNames[0], t1), team2: createTeam(shuffledNames[1], t2) });
  };

  const handlePurchase = async () => {
    if (!squadId) return;
    await fetch(`/api/purchase/${squadId}`, { method: 'POST' });
    const status = await fetch(`/api/squad-status/${squadId}`).then(r => r.json());
    setSquadStatus(status);
    setView('squad');
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-5xl mx-auto overflow-hidden bg-black text-white font-mono uppercase">
      <header className="p-4 pt-8 shrink-0">
        <div className="flex justify-between items-baseline mb-4">
          <div className="text-ceefax-yellow font-['Courier'] font-normal text-[38px] tracking-normal">GAFFER 2.0</div>
        </div>
        <div className="flex justify-between text-sm font-bold border-b-4 border-ceefax-cyan pb-2">
          {view === 'selection' ? (
            <span className="text-ceefax-white">SELECT PLAYERS: {players.filter(x => x.isSelected).length}</span>
          ) : (
            <span className="text-ceefax-white">PLAYERS: {players.length}/99</span>
          )}
        </div>
      </header>

      <main className="flex-grow p-4 space-y-6 overflow-y-auto">
        {view === 'squad' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <input 
                value={newPlayerName} 
                onChange={e => setNewPlayerName(e.target.value.toUpperCase())} 
                placeholder="NAME..." 
                className="input-field text-xl uppercase" 
                onKeyDown={e => e.key === 'Enter' && newPlayerName && (setPlayers([...players, { id: crypto.randomUUID(), name: newPlayerName, rating: 5, position: Position.MIDFIELD, isSelected: false }]), setNewPlayerName(''))}
              />
              <button 
                onClick={() => { if (newPlayerName) setPlayers([...players, { id: crypto.randomUUID(), name: newPlayerName, rating: 5, position: Position.MIDFIELD, isSelected: false }]); setNewPlayerName(''); }} 
                className="bg-ceefax-green text-black px-6 text-xl font-bold border-2 border-ceefax-green hover:bg-black hover:text-ceefax-green transition-all"
              >
                ADD
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {players.map((p, i) => (
                <section key={p.id} className="space-y-2 border-b border-gray-800 pb-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-ceefax-cyan font-bold uppercase">PLAYER {i + 1}</h2>
                    <div className="flex gap-0.5 text-ceefax-yellow">
                      {Array.from({ length: 10 }).map((_, starI) => (
                        <span key={starI} className={starI < p.rating ? 'text-ceefax-yellow' : 'text-gray-700'}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingPlayerId === p.id ? (
                      <input 
                        autoFocus 
                        value={p.name} 
                        onBlur={() => setEditingPlayerId(null)} 
                        onKeyDown={e => e.key === 'Enter' && setEditingPlayerId(null)}
                        onChange={e => setPlayers(players.map(x => x.id === p.id ? { ...x, name: e.target.value.toUpperCase() } : x))} 
                        className="border-2 border-ceefax-yellow p-2 flex-grow text-sm bg-black text-ceefax-white uppercase outline-none font-normal" 
                      />
                    ) : (
                      <div 
                        onClick={() => setEditingPlayerId(p.id)} 
                        className="border-2 border-ceefax-cyan p-2 flex-grow text-sm text-ceefax-white truncate uppercase cursor-text font-normal"
                      >
                        {p.name}
                      </div>
                    )}
                    <div className="flex border-2 border-ceefax-white overflow-hidden">
                      <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.DEFENCE } : x))} className={`px-2 py-2 text-xs font-bold ${p.position === Position.DEFENCE ? 'bg-ceefax-cyan text-black' : 'bg-black text-gray-500'}`}>DEF</button>
                      <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.MIDFIELD } : x))} className={`px-2 py-2 text-xs font-bold ${p.position === Position.MIDFIELD ? 'bg-ceefax-white text-black' : 'bg-black text-gray-500'}`}>MID</button>
                      <button onClick={() => setPlayers(players.map(x => x.id === p.id ? { ...x, position: Position.ATTACK } : x))} className={`px-2 py-2 text-xs font-bold ${p.position === Position.ATTACK ? 'bg-ceefax-yellow text-black' : 'bg-black text-gray-500'}`}>ATT</button>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 items-center">
                    <input type="range" min="1" max="10" value={p.rating} onChange={e => setPlayers(players.map(x => x.id === p.id ? { ...x, rating: parseInt(e.target.value) } : x))} className="w-full accent-ceefax-yellow h-1 bg-ceefax-yellow/50 appearance-none cursor-pointer" />
                    <button onClick={() => setPlayers(players.filter(x => x.id !== p.id))} className="bg-ceefax-red text-white px-4 py-1 text-xs font-bold">DELETE</button>
                  </div>
                </section>
              ))}
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
              <div className="flex justify-center mt-4">
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
                          <span className="w-8 md:w-10 text-ceefax-yellow text-sm md:text-xl font-bold">{t.data.totalRating}</span>
                        </>
                      )}
                    </div>
                    {t.data.players.map(p => (
                      <div key={p.id} className="flex text-sm md:text-xl text-left">
                        <span className="flex-1 truncate pr-2">{p.name}</span>
                        {showPlayerDetails && (
                          <>
                            <span className="w-12 md:w-16 text-white">{p.position.substring(0, 3)}</span>
                            <span className="w-8 md:w-10 text-ceefax-yellow">{p.rating}</span>
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
      </main>

      <div className="shrink-0 bg-black p-4 flex flex-col gap-4">
        <nav className="flex w-full font-bold text-sm gap-4">
          <button 
            onClick={() => setView('squad')} 
            className={`flex-1 py-2 transition-all border-4 border-ceefax-cyan ${view === 'squad' ? 'bg-ceefax-cyan text-black' : 'bg-black text-ceefax-cyan'}`}
          >
            PLAYERS
          </button>
          <button 
            onClick={() => setView('selection')} 
            className={`flex-1 py-2 transition-all border-4 border-ceefax-red ${view === 'selection' ? 'bg-ceefax-red text-black' : 'bg-black text-ceefax-red'}`}
          >
            PICK
          </button>
        </nav>
        {(!squadStatus || squadStatus.is_licensed === 0) && (
          <button onClick={() => setView('payment')} className="w-full bg-ceefax-yellow text-black py-2 font-bold text-sm uppercase border-4 border-ceefax-yellow">&gt; 3-DAY TRIAL OR BUY-IT-NOW FOR £1.99 &lt;</button>
        )}
        <div className="text-center text-xs font-normal text-white bg-black normal-case">
          Copyright - Gary Neill Limited
        </div>
      </div>
    </div>
  );
}
