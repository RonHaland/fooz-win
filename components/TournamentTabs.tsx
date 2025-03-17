"use client";

import { useState, useRef, useEffect } from "react";
import { Tournament, Player, Game } from "@/types/game";
import { GamesContainer } from "./GamesContainer";
import { PlayerStats } from "./PlayerStats";
import { Scoreboard } from "./Scoreboard";
import { PlusIcon } from "./icons/PlusIcon";
import { ErrorModal } from "./ErrorModal";

type TournamentTabsProps = {
  tournament: Tournament;
  onUpdate: (tournament: Tournament) => void;
};

export function TournamentTabs({ tournament, onUpdate }: TournamentTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "admin">("overview");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pairingTracker = useRef(new Set<string>());

  // Calculate games played for each player
  const gamesPlayed = tournament.players.reduce((acc, player) => {
    acc[player.id] = tournament.games.reduce((count, game) => {
      const isPlaying = game.teams.some((team) =>
        team.players.some((p) => p.id === player.id)
      );
      return count + (isPlaying ? 1 : 0);
    }, 0);
    return acc;
  }, {} as Record<number, number>);

  // Initialize pairingTracker
  useEffect(() => {
    pairingTracker.current.clear();
    tournament.games.forEach((game) => {
      game.teams.forEach((team) => {
        const teamKey = team.players
          .map((p) => p.id)
          .sort((a, b) => a - b)
          .join("-");
        pairingTracker.current.add(teamKey);
      });
    });
  }, [tournament.games]);

  const addNewGame = () => {
    const enabledPlayers = tournament.players.filter((p) => p.isEnabled);
    if (enabledPlayers.length < 4) {
      setErrorMessage(
        "At least 4 enabled players are required to generate a game"
      );
      return;
    }

    // Find the minimum games played among enabled players
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
        (p) => !selectedPlayers.some((sp) => sp.id === p.id)
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
        (p) => !selectedPlayers.some((sp) => sp.id === p.id)
      );
    }

    // Try to avoid duplicate teams if possible, but don't prioritize it
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    let team1: Player[] = shuffled.slice(0, 2);
    let team2: Player[] = shuffled.slice(2, 4);
    let attempts = 0;
    let foundNonDuplicate = false;

    while (attempts < 10 && !foundNonDuplicate) {
      const shuffledAttempt = [...selectedPlayers].sort(
        () => Math.random() - 0.5
      );
      const possibleTeam1 = shuffledAttempt.slice(0, 2);
      const possibleTeam2 = shuffledAttempt.slice(2, 4);

      const team1Key = possibleTeam1
        .map((p) => p.id)
        .sort((a, b) => a - b)
        .join("-");
      const team2Key = possibleTeam2
        .map((p) => p.id)
        .sort((a, b) => a - b)
        .join("-");

      if (
        !pairingTracker.current.has(team1Key) &&
        !pairingTracker.current.has(team2Key)
      ) {
        team1 = possibleTeam1;
        team2 = possibleTeam2;
        pairingTracker.current.add(team1Key);
        pairingTracker.current.add(team2Key);
        foundNonDuplicate = true;
      }

      attempts++;
    }

    const newGame: Game = {
      teams: [
        { players: team1, score: 0 },
        { players: team2, score: 0 },
      ],
      sittingOut,
    };

    onUpdate({
      ...tournament,
      games: [...tournament.games, newGame],
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "overview"
              ? "bg-slate-800/50 text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "admin"
              ? "bg-slate-800/50 text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Administration
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === "overview" ? (
          <>
            <section className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <Scoreboard
                players={tournament.players}
                games={tournament.games}
              />
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Games</h2>
                <button
                  onClick={addNewGame}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Game
                </button>
              </div>
              <GamesContainer tournament={tournament} onUpdate={onUpdate} />
            </section>
          </>
        ) : (
          <section className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Player Management
            </h2>
            <PlayerStats
              players={tournament.players}
              gamesPlayed={gamesPlayed}
              onToggleEnabled={(playerId) => {
                onUpdate({
                  ...tournament,
                  players: tournament.players.map((player) =>
                    player.id === playerId
                      ? { ...player, isEnabled: !player.isEnabled }
                      : player
                  ),
                });
              }}
              onRenamePlayer={(playerId, newName) => {
                onUpdate({
                  ...tournament,
                  players: tournament.players.map((player) =>
                    player.id === playerId
                      ? { ...player, name: newName }
                      : player
                  ),
                });
              }}
              onAddPlayer={(name) => {
                const newPlayer = {
                  id: Math.max(...tournament.players.map((p) => p.id), 0) + 1,
                  name,
                  isEnabled: true,
                };
                onUpdate({
                  ...tournament,
                  players: [...tournament.players, newPlayer],
                });
              }}
              onDeletePlayer={(playerId) => {
                if (gamesPlayed[playerId] > 0) return;
                onUpdate({
                  ...tournament,
                  players: tournament.players.filter((p) => p.id !== playerId),
                });
              }}
            />
          </section>
        )}
      </div>

      <ErrorModal
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ""}
      />
    </div>
  );
}
