import { Tournament } from "@/types/game";

const STORAGE_PREFIX = "foozwin_tournament_";

export function getTournamentKey(id: string) {
  return `${STORAGE_PREFIX}${id}`;
}

export function saveTournament(tournament: Tournament) {
  if (typeof window === "undefined") return;
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

export function createTournament(name: string): Tournament {
  const tournament: Tournament = {
    id: crypto.randomUUID(),
    name,
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
  };
  saveTournament(tournament);
  return tournament;
}

export function deleteTournament(id: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getTournamentKey(id));
}
