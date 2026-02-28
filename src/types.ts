export enum Position {
  DEFENCE = 'Defence',
  MIDFIELD = 'Midfield',
  ATTACK = 'Attack'
}

export interface Player {
  id: string;
  name: string;
  rating: number;
  position: Position;
  isSelected?: boolean;
}

export interface Team {
  players: Player[];
  totalRating: number;
  positions: {
    [key in Position]: number;
  };
}
