"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Tournament } from "@/types/game";
import { getTournament, saveTournament } from "@/utils/storage";
import { PlayerStats } from "@/components/PlayerStats";
import { ErrorModal } from "@/components/ErrorModal";

export default function TournamentAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{
    type: "timer" | "overtimer";
    part: "minutes" | "seconds";
    value: string;
  } | null>(null);
  const { id } = use(params);

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

  const handleEditStart = (
    type: "timer" | "overtimer",
    part: "minutes" | "seconds"
  ) => {
    if (
      type === "overtimer" &&
      (!tournament?.config?.enableTimer || !tournament?.config?.enableOvertimer)
    )
      return;
    if (type === "timer" && !tournament?.config?.enableTimer) return;

    const duration =
      type === "timer"
        ? tournament?.config?.timerDuration ?? 300
        : tournament?.config?.overtimerDuration ?? 120;

    const value =
      part === "minutes"
        ? Math.floor(duration / 60)
            .toString()
            .padStart(2, "0")
        : (duration % 60).toString().padStart(2, "0");

    setEditingField({ type, part, value });
  };

  const handleEditComplete = () => {
    if (!editingField || !tournament) return;

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

    handleUpdateTournament({
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

  if (!tournament) return null;

  return (
    <div className="space-y-8">
      <section className="bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">Player Management</h2>
        </div>
        <PlayerStats
          players={tournament.players}
          gamesPlayed={tournament.games.reduce((acc, game) => {
            // Count players in teams
            game.teams.forEach((team) => {
              team.players.forEach((player) => {
                acc[player.id] = (acc[player.id] || 0) + 1;
              });
            });
            return acc;
          }, {} as Record<number, number>)}
          onToggleEnabled={(playerId: number) => {
            handleUpdateTournament({
              ...tournament,
              players: tournament.players.map((player) =>
                player.id === playerId
                  ? { ...player, isEnabled: !player.isEnabled }
                  : player
              ),
            });
          }}
          onRenamePlayer={(playerId: number, newName: string) => {
            handleUpdateTournament({
              ...tournament,
              players: tournament.players.map((player) =>
                player.id === playerId ? { ...player, name: newName } : player
              ),
            });
          }}
          onAddPlayer={(name: string) => {
            const newPlayer = {
              id: Math.max(...tournament.players.map((p) => p.id), 0) + 1,
              name,
              isEnabled: true,
            };
            handleUpdateTournament({
              ...tournament,
              players: [...tournament.players, newPlayer],
            });
          }}
          onDeletePlayer={(playerId: number) => {
            const gamesPlayed = tournament.games.reduce((count, game) => {
              return (
                count +
                (game.teams.some((team) =>
                  team.players.some((p) => p.id === playerId)
                )
                  ? 1
                  : 0)
              );
            }, 0);

            if (gamesPlayed > 0) {
              setErrorMessage("Cannot delete player who has played games");
              return;
            }

            handleUpdateTournament({
              ...tournament,
              players: tournament.players.filter((p) => p.id !== playerId),
            });
          }}
        />
      </section>
      <section className="bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">Tournament Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Enable Timer</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tournament.config?.enableTimer}
                onChange={(e) => {
                  handleUpdateTournament({
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
                  handleUpdateTournament({
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
                      onClick={() => handleEditStart("overtimer", "minutes")}
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
                      className="text-white font-mono px-3 py-1 rounded"
                      onClick={() => handleEditStart("overtimer", "seconds")}
                    >
                      {((tournament.config?.overtimerDuration ?? 120) % 60)
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

      <ErrorModal
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ""}
      />
    </div>
  );
}
