export type Player = { name: string; id: number; isEnabled: boolean };
export type Team = { players: Player[] };
export type Game = { teams: Team[]; sittingOut?: Player[] };
