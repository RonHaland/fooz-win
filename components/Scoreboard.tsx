import { Game, Player } from "@/types/game";
import { SoccerballIcon } from "./icons/SoccerballIcon";

type ScoreboardProps = {
  players: Player[];
  games: Game[];
};

export function Scoreboard({ players, games }: ScoreboardProps) {
  const playerScores = players.reduce((acc, player) => {
    acc[player.id] = games.reduce((score, game) => {
      const playerTeam = game.teams.find((team) =>
        team.players.some((p) => p.id === player.id)
      );
      return score + (playerTeam?.score || 0);
    }, 0);
    return acc;
  }, {} as Record<number, number>);

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort(
    (a, b) => (playerScores[b.id] || 0) - (playerScores[a.id] || 0)
  );

  return (
    <div className="w-full bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <SoccerballIcon className="h-6 w-6 text-amber-400" />
        Scoreboard
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className={`bg-slate-700/30 rounded-lg p-3 flex items-center justify-between ${
              !player.isEnabled ? "opacity-50" : ""
            }`}
          >
            <span className="text-slate-200 font-medium truncate">
              {player.name}
            </span>
            <span className="text-amber-400 font-bold ml-2">
              {playerScores[player.id] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
