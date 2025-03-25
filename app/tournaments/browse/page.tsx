"use client";

import { useEffect, useState } from "react";
import { TournamentShortInfo } from "@/types/game";
import Link from "next/link";
import { FootballIcon } from "@/components/icons/FootballIcon";
import { getPublicTournaments } from "@/app/actions";
import { ArrowIcon } from "@/components/icons";

const ITEMS_PER_PAGE = 10;

export default function BrowseTournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentShortInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await getPublicTournaments(
          currentPage,
          ITEMS_PER_PAGE
        );
        setTournaments(response.tournaments);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Public Tournaments
        </h1>
        <p className="text-slate-400">Browse public tournaments</p>
      </div>

      <div className="grid gap-4 mb-8">
        {tournaments.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700">
            <p className="text-slate-400">No public tournaments available</p>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournament/${tournament.id}`}
              className="group bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-6 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl border border-slate-700/50 hover:border-slate-600/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {tournament.name}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Created{" "}
                    {new Date(tournament.createdAt).toLocaleDateString()} by{" "}
                    <span className="text-emerald-400/60 font-bold">
                      {tournament.ownerName}
                    </span>
                  </p>
                </div>
                <FootballIcon className="h-5 w-5 text-emerald-400" />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 disabled:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowIcon className="h-5 w-5 rotate-180" />
        </button>
        <span className="text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 disabled:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
