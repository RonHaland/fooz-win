"use client";

import { useState, useRef, useEffect } from "react";
import { Tournament } from "@/types/game";
import { GamesList } from "./GamesList";
import { ErrorModal } from "./ErrorModal";
import { GameCard } from "./GameCard";

type GamesContainerProps = {
  tournament: Tournament;
  onUpdate: (tournament: Tournament) => void;
};

export function GamesContainer({ tournament, onUpdate }: GamesContainerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pairingTracker = useRef(new Set<string>());

  // Initialize pairingTracker
  useEffect(() => {
    pairingTracker.current.clear();
    tournament.games.forEach((game) => {
      game.teams.forEach((team) => {
        const teamKey = team.players
          .map((p) => p.id)
          .sort((a, b) => a - b)
          .join("-");
        pairingTracker.current.add(teamKey);
      });
    });
  }, [tournament.games]);

  const handleDeleteGame = (index: number) => {
    onUpdate({
      ...tournament,
      games: tournament.games.filter((_, i) => i !== index),
    });
  };

  const handleScoreChange = (
    gameIndex: number,
    teamIndex: number,
    newScore: number
  ) => {
    onUpdate({
      ...tournament,
      games: tournament.games.map((game, i) =>
        i === gameIndex
          ? {
              ...game,
              teams: game.teams.map((team, j) =>
                j === teamIndex ? { ...team, score: newScore } : team
              ),
            }
          : game
      ),
    });
  };

  // Get the current game (latest) and game history
  const currentGame = tournament.games[tournament.games.length - 1];
  const gameHistory = tournament.games.slice(0, -1);

  return (
    <div className="space-y-8">
      {/* Current Game Section */}
      {currentGame && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xl font-bold text-white">Current Game</h3>
          </div>
          <div className="bg-slate-800/50 rounded-xl border-2 border-emerald-500/50 sm:p-4 shadow-lg shadow-emerald-500/10">
            <GameCard
              game={currentGame}
              index={tournament.games.length - 1}
              players={tournament.players}
              onDelete={() => handleDeleteGame(tournament.games.length - 1)}
              onScoreChange={(teamIndex, newScore) =>
                handleScoreChange(
                  tournament.games.length - 1,
                  teamIndex,
                  newScore
                )
              }
            />
          </div>
        </section>
      )}

      {/* Game History Section */}
      {gameHistory.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white/80">Game History</h3>
          <div className="bg-slate-800/30 rounded-xl sm:border border-slate-700/50 sm:p-4">
            <GamesList
              games={gameHistory}
              players={tournament.players}
              onDeleteGame={handleDeleteGame}
              onScoreChange={handleScoreChange}
            />
          </div>
        </section>
      )}

      <ErrorModal
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ""}
      />
    </div>
  );
}
