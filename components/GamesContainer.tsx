"use client";

import { useState, useRef, useEffect } from "react";
import { Tournament } from "@/types/game";
import { GamesList } from "./GamesList";
import { ErrorModal } from "./ErrorModal";

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

  return (
    <div className="space-y-8">
      <GamesList
        games={tournament.games}
        players={tournament.players}
        onDeleteGame={handleDeleteGame}
        onScoreChange={handleScoreChange}
      />

      <ErrorModal
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ""}
      />
    </div>
  );
}
