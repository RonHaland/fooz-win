"use client";
import { useState } from "react";
import { Game, Player } from "@/types/game";
import { GameCard } from "./GameCard";
import { ConfirmModal } from "./ConfirmModal";

type GamesListProps = {
  games: Game[];
  players: Player[];
  onDeleteGame: (gameId: string) => void;
  onScoreChange: (gameId: string, teamIndex: number, newScore: number) => void;
  isAdmin: boolean;
};

export function GamesList({
  games,
  players,
  onDeleteGame,
  onScoreChange,
  isAdmin,
}: GamesListProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {games.toReversed().map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            index={games.length - 1 - index}
            players={players}
            onDelete={() => setDeleteConfirmation(game.id)}
            onScoreChange={(teamIndex, newScore) =>
              onScoreChange(game.id, teamIndex, newScore)
            }
            isAdmin={isAdmin}
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
