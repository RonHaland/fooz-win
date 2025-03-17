"use client";

import { Game } from "@/types/game";
import { useState } from "react";
import { TrashIcon } from "./icons/TrashIcon";
import { SoccerballIcon } from "./icons/SoccerballIcon";

type GameCardProps = {
  game: Game;
  index: number;
  onDelete: () => void;
  onScoreChange: (teamIndex: number, newScore: number) => void;
};

export function GameCard({
  game,
  index,
  onDelete,
  onScoreChange,
}: GameCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2 flex justify-between items-center">
        <span>Game {index + 1}</span>
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-red-400 transition-colors"
          aria-label={`Delete Game ${index + 1}`}
        >
          <TrashIcon />
        </button>
      </h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          {game.teams.map((team, i) => (
            <div key={i} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-emerald-400">
                  Team {i + 1}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onScoreChange(i, Math.max(0, team.score - 1))
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-600/50 text-slate-300 hover:bg-slate-600 transition-colors"
                    aria-label="Decrease score"
                  >
                    -
                  </button>
                  <div className="flex items-center gap-1">
                    <SoccerballIcon className="h-4 w-4 text-amber-400" />
                    <span className="text-white font-bold w-4 text-center">
                      {team.score}
                    </span>
                  </div>
                  <button
                    onClick={() => onScoreChange(i, team.score + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-600/50 text-slate-300 hover:bg-slate-600 transition-colors"
                    aria-label="Increase score"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {team.players.map((player) => (
                  <p key={player.id} className="text-slate-200">
                    {player.name}
                  </p>
                ))}
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
                Sitting Out ({game.sittingOut.length})
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
              className={`flex flex-col gap-1 overflow-hidden transition-all duration-500 ${
                isExpanded ? "mt-2 max-h-96" : "max-h-0"
              }`}
            >
              {game.sittingOut.map((player) => (
                <p key={player.id} className="text-slate-300">
                  {player.name}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
