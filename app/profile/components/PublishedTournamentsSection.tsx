"use client";

import { TournamentShortInfo } from "@/types/game";
import Link from "next/link";

interface PublishedTournamentsSectionProps {
  tournaments: TournamentShortInfo[];
}

export function PublishedTournamentsSection({
  tournaments,
}: PublishedTournamentsSectionProps) {
  return (
    <section className="bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20 rounded-t-xl">
        <h2 className="text-2xl font-bold text-white">Published Tournaments</h2>
      </div>
      <div className="p-6 space-y-4">
        {tournaments.length === 0 ? (
          <p className="text-slate-400">No published tournaments yet</p>
        ) : (
          <div className="space-y-2">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}/admin`}
                className="block p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">
                      {tournament.name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(tournament.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      tournament.isPublic
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "bg-blue-950/80 text-blue-400"
                    }`}
                  >
                    {tournament.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
