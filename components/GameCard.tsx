"use client";

import { Game, Player } from "@/types/game";
import { useState } from "react";
import { TrashIcon } from "./icons/TrashIcon";
import { FootballIcon } from "./icons/FootballIcon";

type GameCardProps = {
  game: Game;
  index: number;
  onDelete: () => void;
  onScoreChange: (teamIndex: number, newScore: number) => void;
  players: Player[];
};

export function GameCard({
  game,
  index,
  onDelete,
  onScoreChange,
  players,
}: GameCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to get current player name
  const getPlayerName = (playerId: number) => {
    return players.find((p) => p.id === playerId)?.name || "Unknown Player";
  };

  return (
    <article className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 flex flex-col gap-3 shadow-lg hover:shadow-xl transition-shadow border border-white/10">
      <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-1 px-2 flex justify-between items-center">
        <span>Game {index + 1}</span>
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-red-400 transition-colors"
          aria-label={`Delete Game ${index + 1}`}
        >
          <TrashIcon />
        </button>
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {game.teams.map((team, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg p-4 border ${
                i === 0
                  ? "border-blue-500/30 shadow-lg shadow-blue-500/5"
                  : "border-amber-500/30 shadow-lg shadow-amber-500/5"
              }`}
            >
              <div className="grid grid-cols-[1fr_auto] items-center mb-4 text-center">
                <h3
                  className={`text-lg font-semibold ${
                    i === 0 ? "text-blue-400" : "text-amber-400"
                  }`}
                >
                  Team {i + 1}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onScoreChange(i, team.score > 0 ? team.score - 1 : 10)
                    }
                    className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                      i === 0
                        ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    } transition-colors`}
                    aria-label="Decrease score"
                  >
                    -
                  </button>
                  <div className="flex items-center gap-1">
                    <FootballIcon
                      className={`h-4 w-4 ${
                        i === 0 ? "text-blue-400" : "text-amber-400"
                      }`}
                    />
                    <span
                      className={`font-bold w-4 text-center ${
                        i === 0 ? "text-blue-400" : "text-amber-400"
                      }`}
                    >
                      {team.score}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      onScoreChange(i, team.score < 10 ? team.score + 1 : 0)
                    }
                    className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                      i === 0
                        ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    } transition-colors`}
                    aria-label="Increase score"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_15px_1fr] gap-2">
                <p
                  key={team.players[0].id}
                  className={`text-center whitespace-nowrap text-ellipsis place-self-end ${
                    i === 0 ? "text-blue-200" : "text-amber-200"
                  }`}
                >
                  {getPlayerName(team.players[0].id)}
                </p>
                <span
                  className={`text-center ${
                    i === 0 ? "text-blue-400" : "text-amber-400"
                  }`}
                >
                  &
                </span>
                <p
                  key={team.players[1].id}
                  className={`text-center whitespace-nowrap text-ellipsis place-self-start ${
                    i === 0 ? "text-blue-200" : "text-amber-200"
                  }`}
                >
                  {getPlayerName(team.players[1].id)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {game.sittingOut && game.sittingOut.length > 0 && (
          <div className="bg-slate-700/20 rounded-lg p-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between text-left"
              aria-expanded={isExpanded}
              aria-controls={`sitting-out-${index}`}
            >
              <h3 className="text-lg font-semibold text-amber-400">
                Sitting Out{" "}
                <span className="bg-amber-300/30 border border-amber-100/40 w-6 h-6 inline-flex justify-center items-center rounded-full">
                  {game.sittingOut.length}
                </span>
              </h3>
              <svg
                className={`w-5 h-5 text-amber-400 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              id={`sitting-out-${index}`}
              role="region"
              aria-labelledby={`sitting-out-button-${index}`}
              className={`flex flex-col gap-1 overflow-hidden transition-all duration-150 ease-in-out ${
                isExpanded ? "mt-2 max-h-96" : "max-h-0"
              }`}
            >
              {game.sittingOut.map((player) => (
                <p key={player.id} className="text-slate-300">
                  {getPlayerName(player.id)}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
