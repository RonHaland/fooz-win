"use client";

import { useState, useEffect } from "react";
import { Tournament } from "@/types/game";
import {
  getAllTournaments,
  createTournament,
  deleteTournament,
} from "@/utils/storage";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import Link from "next/link";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showNewTournamentModal, setShowNewTournamentModal] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );

  useEffect(() => {
    setTournaments(getAllTournaments());
  }, []);

  const handleCreateTournament = () => {
    if (!newTournamentName.trim()) return;
    const tournament = createTournament(newTournamentName.trim());
    setTournaments([tournament, ...tournaments]);
    setNewTournamentName("");
    setShowNewTournamentModal(false);
  };

  const handleDeleteTournament = (id: string) => {
    deleteTournament(id);
    setTournaments(tournaments.filter((t) => t.id !== id));
    setDeleteConfirmation(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-4xl font-bold"
            style={{ viewTransitionName: "page-title" }}
          >
            Tournaments
          </h1>
          <button
            onClick={() => setShowNewTournamentModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            New Tournament
          </button>
        </div>

        <div className="grid gap-4">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournament/${tournament.id}`}
              className="bg-slate-800 rounded-xl p-6 flex items-center justify-between hover:bg-slate-700/50 transition-colors group"
            >
              <div
                style={{
                  viewTransitionName: `tournament-card-${tournament.id}`,
                }}
              >
                <div className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {tournament.name}
                </div>
                <p className="text-slate-400 text-sm">
                  {tournament.players.length} players ·{" "}
                  {tournament.games.length} games
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteConfirmation(tournament.id);
                }}
                className="text-slate-400 hover:text-red-400 transition-colors"
                aria-label="Delete tournament"
              >
                <TrashIcon />
              </button>
            </Link>
          ))}
        </div>
      </div>

      {showNewTournamentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              New Tournament
            </h2>
            <input
              type="text"
              value={newTournamentName}
              onChange={(e) => setNewTournamentName(e.target.value)}
              placeholder="Tournament name"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTournament();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewTournamentModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTournament}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={() => {
          if (deleteConfirmation) handleDeleteTournament(deleteConfirmation);
        }}
        title="Delete Tournament"
        message="Are you sure you want to delete this tournament? This action cannot be undone."
      />
    </main>
  );
}
