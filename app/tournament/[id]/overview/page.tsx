"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Tournament, Player } from "@/types/game";
import { Scoreboard } from "@/components/Scoreboard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GamesContainer } from "@/components/GamesContainer";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { ErrorModal } from "@/components/ErrorModal";
import { unstable_ViewTransition as ViewTransition } from "react";
import { useTournament } from "../admin/hooks/useTournament";
export default function TournamentOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { id } = use(params);
  const { tournament, setTournament } = useTournament(id);

  const handleUpdateTournament = (updatedTournament: Tournament) => {
    updatedTournament.updatedAt = new Date().toISOString();
    setTournament(updatedTournament);
  };

  const handleAdminTabClick = () => {
    router.push(`/tournament/${id}/admin`);
  };

  const addNewGame = () => {
    if (!tournament) return;

    const enabledPlayers = tournament.players.filter((p) => p.isEnabled);
    if (enabledPlayers.length < 4) {
      setErrorMessage(
        "At least 4 enabled players are required to generate a game"
      );
      return;
    }

    // Find the minimum games played among enabled players
    const gamesPlayed = tournament.players.reduce((acc, player) => {
      acc[player.id] = tournament.games.reduce((count, game) => {
        // Only count games where the player is actually playing (not sitting out)
        const isPlaying = game.teams.some((team) =>
          team.players.some((p) => p.id === player.id)
        );
        return count + (isPlaying ? 1 : 0);
      }, 0);
      return acc;
    }, {} as Record<string, number>);

    const minGames = Math.min(...enabledPlayers.map((p) => gamesPlayed[p.id]));

    // Get enabled players with minimum games played
    const playersWithMinGames = enabledPlayers.filter(
      (p) => gamesPlayed[p.id] === minGames
    );

    // If we have enough players with minimum games, prioritize them
    let selectedPlayers: Player[];
    let sittingOut: Player[];

    if (playersWithMinGames.length >= 4) {
      // Randomly select 4 players from those with minimum games
      selectedPlayers = [...playersWithMinGames]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      sittingOut = enabledPlayers.filter(
        (p) => !selectedPlayers.some((sp: Player) => sp.id === p.id)
      );
    } else {
      // We need additional players - prioritize those with fewer games
      const remainingNeeded = 4 - playersWithMinGames.length;
      const otherPlayers = enabledPlayers
        .filter((p) => gamesPlayed[p.id] > minGames)
        .sort((a, b) => gamesPlayed[a.id] - gamesPlayed[b.id])
        .slice(0, remainingNeeded);

      selectedPlayers = [...playersWithMinGames, ...otherPlayers];
      sittingOut = enabledPlayers.filter(
        (p) => !selectedPlayers.some((sp: Player) => sp.id === p.id)
      );
    }

    // Try to avoid duplicate teams if possible, but don't prioritize it
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    const team1 = shuffled.slice(0, 2);
    const team2 = shuffled.slice(2, 4);

    const newGame = {
      id: crypto.randomUUID(),
      teams: [
        { players: team1, score: 0 },
        { players: team2, score: 0 },
      ],
      sittingOut,
    };

    handleUpdateTournament({
      ...tournament,
      games: [...tournament.games, newGame],
    });
  };

  if (!tournament) return null;

  return (
    <ViewTransition>
      <div className="space-y-8">
        <section className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <Scoreboard
            players={tournament.players}
            games={tournament.games}
            onClickAdminTab={handleAdminTabClick}
          />
        </section>

        {tournament.config?.enableTimer && (
          <section className="space-y-6">
            <CountdownTimer tournament={tournament} />
          </section>
        )}

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Games</h2>
            <button
              onClick={addNewGame}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-3 
                      rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center 
                      gap-2 hover:shadow-lg shadow-emerald-800/40 hover:cursor-pointer"
            >
              <PlusIcon className="h-5 w-5" />
              Add Game
            </button>
          </div>
          <GamesContainer
            tournament={tournament}
            onUpdate={handleUpdateTournament}
          />
        </section>

        <ErrorModal
          isOpen={errorMessage !== null}
          onClose={() => setErrorMessage(null)}
          message={errorMessage || ""}
        />
      </div>
    </ViewTransition>
  );
}
