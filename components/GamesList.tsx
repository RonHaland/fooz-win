"use client";
import { useState } from "react";
import { Game, Player } from "@/types/game";
import { GameCard } from "./GameCard";
import { ConfirmModal } from "./ConfirmModal";

type GamesListProps = {
  games: Game[];
  players: Player[];
  onDeleteGame: (index: number) => void;
  onScoreChange: (
    gameIndex: number,
    teamIndex: number,
    newScore: number
  ) => void;
};

export function GamesList({
  games,
  players,
  onDeleteGame,
  onScoreChange,
}: GamesListProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(
    null
  );

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {games.map((game, index) => (
          <GameCard
            key={index}
            game={game}
            index={index}
            players={players}
            onDelete={() => setDeleteConfirmation(index)}
            onScoreChange={(teamIndex, newScore) =>
              onScoreChange(index, teamIndex, newScore)
            }
          />
        ))}
      </section>
      <ConfirmModal
        isOpen={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={() => {
          if (deleteConfirmation !== null) {
            onDeleteGame(deleteConfirmation);
            setDeleteConfirmation(null);
          }
        }}
        title="Delete Game"
        message={`Are you sure you want to delete Game ${
          deleteConfirmation !== null ? deleteConfirmation + 1 : ""
        }? This action cannot be undone.`}
      />
    </>
  );
}
