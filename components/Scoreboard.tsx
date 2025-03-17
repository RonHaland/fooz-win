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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-4 text-slate-400 font-medium w-16">
                #
              </th>
              <th className="text-left py-2 px-4 text-slate-400 font-medium">
                Name
              </th>
              <th className="text-right py-2 px-4 text-slate-400 font-medium">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr
                key={player.id}
                className={`border-b border-slate-700/50 ${
                  !player.isEnabled ? "opacity-50" : ""
                }`}
              >
                <td className="py-3 px-4 text-slate-300">{index + 1}</td>
                <td className="py-3 px-4 text-slate-200 font-medium">
                  {player.name}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-amber-400 font-bold">
                    {playerScores[player.id] || 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
