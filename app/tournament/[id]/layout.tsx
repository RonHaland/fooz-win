"use client";

import { use } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { FootballIcon } from "@/components/icons/FootballIcon";
import Link from "next/link";
import { TournamentProvider } from "./TournamentContext";
import { useTournament } from "./hooks/useTournament";

export default function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = use(params);
  const { tournament, isOnline, setTournament, isAdmin } = useTournament(id);

  if (!tournament) return null;

  const isOverview = pathname.endsWith("/overview");
  const isAdminPage = pathname.endsWith("/admin");

  return (
    <TournamentProvider
      tournament={tournament}
      setTournament={setTournament}
      isAdmin={isAdmin}
      isOnline={isOnline}
    >
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="text-3xl sm:text-4xl font-bold overflow-hidden text-ellipsis"
                style={{
                  viewTransitionName: `tournament-card-${tournament.id}`,
                }}
              >
                <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent truncate">
                  {tournament.name}
                </span>
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                {isOnline ? (
                  <span className="text-emerald-400">Online</span>
                ) : (
                  <span className="text-gray-400">Offline</span>
                )}
                <span className="text-slate-600">•</span>
                <span className="flex items-center">
                  <FootballIcon className="h-4 w-4 mr-1" />
                  {tournament.games.length} games
                </span>
                <span className="text-slate-600">•</span>
                <span>{tournament.players.length} players</span>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-slate-700/50 mb-8">
            <button
              onClick={() => router.push(`/tournament/${id}/overview`)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 hover:cursor-pointer ${
                isOverview
                  ? "bg-slate-800/50 text-emerald-400 border-emerald-400"
                  : "text-slate-400 hover:text-slate-300 hover:border-emerald-400/20 border-transparent"
              }`}
            >
              Overview
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push(`/tournament/${id}/admin`)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 hover:cursor-pointer ${
                  isAdminPage
                    ? "bg-slate-800/50 text-emerald-400 border-emerald-400"
                    : "text-slate-400 hover:text-slate-300 hover:border-emerald-400/20 border-transparent"
                }`}
              >
                Administration
              </button>
            )}
          </div>

          {/* Tab Content */}
          {children}
        </div>
      </div>
    </TournamentProvider>
  );
}
