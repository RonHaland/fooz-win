import { Tournament } from "@/types/game";

const STORAGE_PREFIX = "foozwin_tournament_";

export function getTournamentKey(id: string) {
  return `${STORAGE_PREFIX}${id}`;
}

export function saveTournament(tournament: Tournament) {
  if (typeof window === "undefined") return;

  const updatedPlayerMap = new Map<string, string>(); // map of old player id to new player id
  tournament = {
    ...tournament,
    players: tournament.players.map((player) => {
      const existingId = player.id;
      player.id = isUUID(player.id) ? player.id : crypto.randomUUID();
      updatedPlayerMap.set(existingId, player.id);
      return player;
    }),
    games: tournament.games.map((game) => {
      game.teams = game.teams.map((team) => {
        team.players = team.players.map((player) => {
          player.id = updatedPlayerMap.get(player.id) ?? player.id;
          return player;
        });
        return team;
      });
      return game;
    }),
  };

  localStorage.setItem(
    getTournamentKey(tournament.id),
    JSON.stringify(tournament)
  );
}

export function getTournament(id: string): Tournament | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(getTournamentKey(id));
  return data ? JSON.parse(data) : null;
}

export function getAllTournaments(): Tournament[] {
  if (typeof window === "undefined") return [];

  return Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .map((key) => JSON.parse(localStorage.getItem(key) || ""))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export function createTournament(name: string, ownerId?: string): Tournament {
  const tournament: Tournament = {
    id: crypto.randomUUID(),
    name,
    ownerId: ownerId,
    players: [],
    games: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      enableTimer: true,
      timerDuration: 360,
      enableOvertimer: true,
      overtimerDuration: 120,
    },
    users: [],
    admins: [],
    isActive: false,
  };
  saveTournament(tournament);
  return tournament;
}

export function deleteTournament(id: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getTournamentKey(id));
}

export function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
