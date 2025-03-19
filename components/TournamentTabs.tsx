"use client";

import { useState, useRef, useEffect } from "react";
import { Tournament, Player, Game } from "@/types/game";
import { GamesContainer } from "./GamesContainer";
import { PlayerStats } from "./PlayerStats";
import { Scoreboard } from "./Scoreboard";
import { PlusIcon } from "./icons/PlusIcon";
import { ErrorModal } from "./ErrorModal";
import { CountdownTimer } from "./CountdownTimer";

type TournamentTabsProps = {
  tournament: Tournament;
  onUpdate: (tournament: Tournament) => void;
};

export function TournamentTabs({ tournament, onUpdate }: TournamentTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "admin">("overview");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOvertime] = useState(false);
  const [editingField, setEditingField] = useState<{
    type: "timer" | "overtimer";
    part: "minutes" | "seconds";
    value: string;
  } | null>(null);
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

  const handleEditStart = (
    type: "timer" | "overtimer",
    part: "minutes" | "seconds"
  ) => {
    if (
      type === "overtimer" &&
      (!tournament.config?.enableTimer || !tournament.config?.enableOvertimer)
    )
      return;
    if (type === "timer" && !tournament.config?.enableTimer) return;

    const duration =
      type === "timer"
        ? tournament.config?.timerDuration ?? 300
        : tournament.config?.overtimerDuration ?? 120;

    const value =
      part === "minutes"
        ? Math.floor(duration / 60)
            .toString()
            .padStart(2, "0")
        : (duration % 60).toString().padStart(2, "0");

    setEditingField({ type, part, value });
  };

  const handleEditComplete = () => {
    if (!editingField) return;

    const { type, part, value } = editingField;
    const currentDuration =
      type === "timer"
        ? tournament.config?.timerDuration ?? 300
        : tournament.config?.overtimerDuration ?? 120;

    let newDuration: number;
    if (part === "minutes") {
      const minutes = parseInt(value) || 0;
      const seconds = currentDuration % 60;
      newDuration = minutes * 60 + seconds;
    } else {
      const minutes = Math.floor(currentDuration / 60);
      const seconds = Math.min(59, Math.max(0, parseInt(value) || 0));
      newDuration = minutes * 60 + seconds;
    }

    onUpdate({
      ...tournament,
      config: {
        ...tournament.config!,
        [type === "timer" ? "timerDuration" : "overtimerDuration"]: newDuration,
      },
    });

    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 hover:cursor-pointer ${
            activeTab === "overview"
              ? "bg-slate-800/50 text-emerald-400 border-emerald-400"
              : "text-slate-400 hover:text-slate-300 hover:border-emerald-400/20 border-transparent"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 hover:cursor-pointer ${
            activeTab === "admin"
              ? "bg-slate-800/50 text-emerald-400 border-emerald-400"
              : "text-slate-400 hover:text-slate-300 hover:border-emerald-400/20 border-transparent"
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
                onClickAdminTab={() => setActiveTab("admin")}
              />
            </section>
            {tournament.config?.enableTimer && (
              <section className="space-y-6">
                {!isOvertime ? (
                  <CountdownTimer tournament={tournament} />
                ) : (
                  <CountdownTimer tournament={tournament} />
                )}
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
              <GamesContainer tournament={tournament} onUpdate={onUpdate} />
            </section>
          </>
        ) : (
          <>
            <section className="bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">
                  Player Management
                </h2>
              </div>
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
                    players: tournament.players.filter(
                      (p) => p.id !== playerId
                    ),
                  });
                }}
              />
            </section>
            <section className="bg-slate-800/50 rounded-xl border border-slate-700/50 mt-6">
              <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">
                  Tournament Settings
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">Enable Timer</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tournament.config?.enableTimer}
                      onChange={(e) => {
                        onUpdate({
                          ...tournament,
                          config: {
                            ...tournament.config!,
                            enableTimer: e.target.checked,
                          },
                        });
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 checked:bg-emerald-600"
                    />
                    <div className="flex items-center gap-1">
                      <div
                        className="flex items-center gap-1 cursor-pointer hover:bg-slate-700/50 px-3 py-1 rounded transition-colors"
                        onClick={() => handleEditStart("timer", "minutes")}
                      >
                        {editingField?.type === "timer" &&
                        editingField?.part === "minutes" ? (
                          <input
                            type="number"
                            value={editingField.value}
                            onChange={(e) =>
                              setEditingField((prev) =>
                                prev ? { ...prev, value: e.target.value } : null
                              )
                            }
                            onBlur={handleEditComplete}
                            onKeyDown={handleKeyDown}
                            className="bg-slate-700 text-white rounded px-3 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            min="0"
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-mono">
                            {Math.floor(
                              (tournament.config?.timerDuration ?? 300) / 60
                            )
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      <span className="text-white">:</span>
                      <div
                        className="flex items-center gap-1 cursor-pointer hover:bg-slate-700/50 px-3 py-1 rounded transition-colors"
                        onClick={() => handleEditStart("timer", "seconds")}
                      >
                        {editingField?.type === "timer" &&
                        editingField?.part === "seconds" ? (
                          <input
                            type="number"
                            value={editingField.value}
                            onChange={(e) =>
                              setEditingField((prev) =>
                                prev ? { ...prev, value: e.target.value } : null
                              )
                            }
                            onBlur={handleEditComplete}
                            onKeyDown={handleKeyDown}
                            className="bg-slate-700 text-white rounded px-3 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            min="0"
                            max="59"
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-mono">
                            {((tournament.config?.timerDuration ?? 300) % 60)
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">
                    Enable Overtime Timer
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tournament.config?.enableOvertimer}
                      disabled={!tournament.config?.enableTimer}
                      onChange={(e) => {
                        onUpdate({
                          ...tournament,
                          config: {
                            ...tournament.config!,
                            enableOvertimer: e.target.checked,
                          },
                        });
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                    />
                    <div className="flex items-center gap-1">
                      <div
                        className={`transition-colors rounded ${
                          tournament.config?.enableTimer &&
                          tournament.config?.enableOvertimer
                            ? "cursor-pointer hover:bg-slate-700/50"
                            : "opacity-50"
                        }`}
                      >
                        {editingField?.type === "overtimer" &&
                        editingField?.part === "minutes" ? (
                          <input
                            type="number"
                            value={editingField.value}
                            onChange={(e) =>
                              setEditingField((prev) =>
                                prev ? { ...prev, value: e.target.value } : null
                              )
                            }
                            onBlur={handleEditComplete}
                            onKeyDown={handleKeyDown}
                            className="bg-slate-700 text-white rounded px-3 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            min="0"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="text-white font-mono px-3 py-1 rounded"
                            onClick={() =>
                              handleEditStart("overtimer", "minutes")
                            }
                          >
                            {Math.floor(
                              (tournament.config?.overtimerDuration ?? 120) / 60
                            )
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      <span className="text-white">:</span>
                      <div
                        className={`transition-colors rounded ${
                          tournament.config?.enableTimer &&
                          tournament.config?.enableOvertimer
                            ? "cursor-pointer hover:bg-slate-700/50"
                            : "opacity-50"
                        }`}
                      >
                        {editingField?.type === "overtimer" &&
                        editingField?.part === "seconds" ? (
                          <input
                            type="number"
                            value={editingField.value}
                            onChange={(e) =>
                              setEditingField((prev) =>
                                prev ? { ...prev, value: e.target.value } : null
                              )
                            }
                            onBlur={handleEditComplete}
                            onKeyDown={handleKeyDown}
                            className="bg-slate-700 text-white rounded px-3 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            min="0"
                            max="59"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="text-white font-mono  px-3 py-1 rounded"
                            onClick={() =>
                              handleEditStart("overtimer", "seconds")
                            }
                          >
                            {(
                              (tournament.config?.overtimerDuration ?? 120) % 60
                            )
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
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
