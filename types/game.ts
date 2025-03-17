export type Player = {
  id: number;
  name: string;
  isEnabled: boolean;
};

export type Team = {
  players: Player[];
  score: number;
};

export type Game = {
  teams: Team[];
  sittingOut?: Player[];
};

export type Tournament = {
  id: string;
  name: string;
  players: Player[];
  games: Game[];
  createdAt: string;
  updatedAt: string;
};
