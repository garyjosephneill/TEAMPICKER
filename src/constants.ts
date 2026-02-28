import { Position, Player } from './types';

export const INITIAL_PLAYERS: Player[] = Array.from({ length: 12 }, (_, i) => ({
  id: crypto.randomUUID(),
  name: `Player ${i + 1}`,
  rating: 5,
  position: Position.MIDFIELD,
}));

export const POSITIONS = [Position.DEFENCE, Position.MIDFIELD, Position.ATTACK];
