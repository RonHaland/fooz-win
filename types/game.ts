export type Player = {
  id: string;
  name: string;
  isEnabled: boolean;
};

export type Team = {
  players: Player[];
  score: number;
};

export type Game = {
  id: string;
  teams: Team[];
  sittingOut?: Player[];
};

export type Tournament = {
  id: string;
  name: string;
  ownerId?: string;
  players: Player[];
  users: User[];
  admins: User[];
  games: Game[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  config?: TournamentConfig;
  isPublic?: boolean;
};

export type TournamentConfig = {
  enableTimer: boolean;
  timerDuration: number;
  enableOvertimer: boolean;
  overtimerDuration: number;
};

export interface User {
  id: string;
  name: string;
  email: string;
}

export type TournamentShortInfo = {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
};
