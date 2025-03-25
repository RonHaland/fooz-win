import { Game } from "@/types/game";

export function gamesPlayed(games: Game[]) {
  return games.reduce((acc, game) => {
    game.teams.forEach((team) => {
      team.players.forEach((player) => {
        acc[player.id] = (acc[player.id] || 0) + 1;
      });
    });
    return acc;
  }, {} as Record<string, number>);
}
