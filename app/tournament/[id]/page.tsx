"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Tournament } from "@/types/game";
import { getTournament, saveTournament } from "@/utils/storage";
import { GamesContainer } from "@/components/GamesContainer";
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
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto flex flex-col items-center">
        <div className="w-full max-w-4xl mb-8">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-300 transition-colors mb-2 inline-block"
          >
            ← Back to Tournaments
          </Link>
          <h1
            className="text-4xl font-bold"
            style={{ viewTransitionName: "page-title" }}
          >
            <span
              style={{ viewTransitionName: `tournament-card-${tournament.id}` }}
            >
              {tournament.name}
            </span>
          </h1>
        </div>
        <GamesContainer
          tournament={tournament}
          onUpdate={handleUpdateTournament}
        />
      </div>
    </div>
  );
}
