import { Game, Player } from "@/types/game";
import { FootballIcon } from "./icons/FootballIcon";

type ScoreboardProps = {
  players: Player[];
  games: Game[];
  onClickAdminTab?: () => void;
};

export function Scoreboard({
  players,
  games,
  onClickAdminTab,
}: ScoreboardProps) {
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
    <div className="w-full">
      <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FootballIcon className="h-6 w-6 text-amber-400" />
          Scoreboard
        </h2>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          {!!players.length && (
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
                    } ${
                      index === 0
                        ? "bg-amber-400/10"
                        : index === 1
                        ? "bg-white/10"
                        : index === 2
                        ? "bg-amber-800/20"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      {index === 0 ? (
                        <span className="text-amber-400 font-bold">1st</span>
                      ) : index === 1 ? (
                        <span className="text-slate-300 font-bold">2nd</span>
                      ) : index === 2 ? (
                        <span className="text-orange-700 font-bold">3rd</span>
                      ) : (
                        <span className="text-slate-500">{index + 1}th</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {player.name}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-bold ${
                          index === 0 ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {playerScores[player.id] || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!players.length && (
            <div className="flex flex-col p-6 items-center">
              <span>
                Add players in the{" "}
                <button
                  className="inline-block text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-3 hover:cursor-pointer"
                  onClick={onClickAdminTab}
                >
                  Administration tab
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
