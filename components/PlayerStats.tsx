"use client";
import { useState } from "react";
import { Player } from "@/types/game";
import { AddPlayerModal } from "./AddPlayerModal";
import { ConfirmModal } from "./ConfirmModal";
import { PlusIcon } from "./icons/PlusIcon";
import { TrashIcon } from "./icons/TrashIcon";

type PlayerStatsProps = {
  players: Player[];
  gamesPlayed: Record<number, number>;
  onToggleEnabled: (playerId: number) => void;
  onRenamePlayer: (playerId: number, newName: string) => void;
  onAddPlayer: (name: string) => void;
  onDeletePlayer: (playerId: number) => void;
};

export function PlayerStats({
  players,
  gamesPlayed,
  onToggleEnabled,
  onRenamePlayer,
  onAddPlayer,
  onDeletePlayer,
}: PlayerStatsProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    playerId: number;
    playerName: string;
  } | null>(null);

  const handleStartEdit = (player: Player) => {
    setEditingId(player.id);
    setEditingName(player.name);
  };

  const handleSaveEdit = () => {
    if (editingId === null) return;

    const trimmedName = editingName.trim();
    if (!trimmedName) return;

    const existingNames = players
      .filter((p) => p.id !== editingId)
      .map((p) => p.name);

    if (existingNames.includes(trimmedName)) return;

    onRenamePlayer(editingId, trimmedName);
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <h2 className="text-2xl font-bold text-white">Games Played</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Add Player
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className={`bg-slate-700/30 rounded-lg p-4 flex flex-col items-center transition-colors ${
              !player.isEnabled ? "opacity-50" : ""
            }`}
          >
            {editingId === player.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                className="bg-slate-600/50 text-white px-2 py-1 rounded text-center w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            ) : (
              <p
                className="text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors"
                onClick={() => handleStartEdit(player)}
              >
                {player.name}
              </p>
            )}
            <p className="text-3xl font-bold text-emerald-400">
              {gamesPlayed[player.id]}
            </p>
            <p className="text-slate-400 text-sm mb-2">games</p>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleEnabled(player.id)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  player.isEnabled
                    ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                }`}
              >
                {player.isEnabled ? "Disable" : "Enable"}
              </button>
              {gamesPlayed[player.id] === 0 && (
                <button
                  onClick={() =>
                    setDeleteConfirmation({
                      playerId: player.id,
                      playerName: player.name,
                    })
                  }
                  className="p-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddPlayer}
        existingNames={players.map((p) => p.name)}
      />
      <ConfirmModal
        isOpen={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={() => {
          if (deleteConfirmation) {
            onDeletePlayer(deleteConfirmation.playerId);
          }
        }}
        title="Delete Player"
        message={`Are you sure you want to delete ${deleteConfirmation?.playerName}? This action cannot be undone.`}
      />
    </div>
  );
}
