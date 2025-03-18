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
import { InfoSection } from "@/components/InfoSection";
import { NewTournamentModal } from "@/components/NewTournamentModal";
import { FootballIcon } from "@/components/icons/FootballIcon";

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showNewTournamentModal, setShowNewTournamentModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );

  useEffect(() => {
    setTournaments(getAllTournaments());
  }, []);

  const handleCreateTournament = (name: string) => {
    if (!name.trim()) return;
    const tournament = createTournament(name.trim());
    setTournaments([tournament, ...tournaments]);
    setShowNewTournamentModal(false);
  };

  const handleDeleteTournament = (id: string) => {
    deleteTournament(id);
    setTournaments(tournaments.filter((t) => t.id !== id));
    setDeleteConfirmation(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <FootballIcon className="h-12 w-12 text-emerald-400 animate-spin-slow" />
            </div>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ viewTransitionName: "page-title" }}
          >
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent inline-block">
              Foozball.win
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Tournament management for foosball
          </p>
          <button
            onClick={() => setShowNewTournamentModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Tournament
          </button>
        </div>

        {/* Tournaments Grid */}
        <div className="grid gap-4">
          {tournaments.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700">
              <p className="text-slate-400 mb-4">No tournaments yet</p>
              <button
                onClick={() => setShowNewTournamentModal(true)}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Create your first tournament
              </button>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}`}
                className="group relative bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-6 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl border border-slate-700/50 hover:border-slate-600/50"
              >
                <div
                  style={{
                    viewTransitionName: `tournament-card-${tournament.id}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {tournament.name}
                      </h2>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <span className="flex items-center">
                          <FootballIcon className="h-4 w-4 mr-1" />
                          {tournament.games.length} games
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>{tournament.players.length} players</span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteConfirmation(tournament.id);
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded-lg"
                      aria-label="Delete tournament"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="text-sm text-slate-500">
                    Last updated:{" "}
                    {new Date(tournament.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Info Section */}
        <InfoSection />
      </div>

      {/* New Tournament Modal */}
      {showNewTournamentModal && (
        <NewTournamentModal
          isOpen={showNewTournamentModal}
          onClose={() => setShowNewTournamentModal(false)}
          onCreateTournament={handleCreateTournament}
        />
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
