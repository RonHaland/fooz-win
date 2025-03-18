"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Tournament } from "@/types/game";
import { getTournament, saveTournament } from "@/utils/storage";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { FootballIcon } from "@/components/icons/FootballIcon";
import { TournamentTabs } from "@/components/TournamentTabs";
import Link from "next/link";

export default function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const loadedTournament = getTournament(id);
    if (!loadedTournament) {
      router.push("/");
      return;
    }
    setTournament(loadedTournament);
  }, [id, router]);

  const handleUpdateTournament = (updatedTournament: Tournament) => {
    updatedTournament.updatedAt = new Date().toISOString();
    saveTournament(updatedTournament);
    setTournament(updatedTournament);
  };

  if (!tournament) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-110"
            style={{ viewTransitionName: "back-button" }}
          >
            <ArrowLeftIcon className="h-6 w-6 text-slate-400" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1
              className="text-4xl font-bold"
              style={{ viewTransitionName: `tournament-card-${tournament.id}` }}
            >
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent inline-block">
                {tournament.name}
              </span>
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <span className="flex items-center">
                <FootballIcon className="h-4 w-4 mr-1" />
                {tournament.games.length} games
              </span>
              <span className="text-slate-600">•</span>
              <span>{tournament.players.length} players</span>
            </p>
          </div>
        </div>

        <TournamentTabs
          tournament={tournament}
          onUpdate={handleUpdateTournament}
        />
      </div>
    </main>
  );
}
