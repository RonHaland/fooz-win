"use client";
import { useState } from "react";
import { Game } from "@/types/game";
import { GameCard } from "./GameCard";
import { ConfirmModal } from "./ConfirmModal";

type GamesListProps = {
  games: Game[];
  onDeleteGame: (index: number) => void;
};

export function GamesList({ games, onDeleteGame }: GamesListProps) {
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
            onDelete={() => setDeleteConfirmation(index)}
          />
        ))}
      </section>
      <ConfirmModal
        isOpen={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={() => {
          if (deleteConfirmation !== null) {
            onDeleteGame(deleteConfirmation);
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
