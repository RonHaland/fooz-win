"use client";

import { Tournament } from "@/types/game";
import { Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
interface TournamentSettingsSectionProps {
  tournament: Tournament;
  isPublishing: boolean;
  isUnpublishing: boolean;
  editingField: {
    type: "timer" | "overtimer" | "name";
    part?: "minutes" | "seconds";
    value: string;
  } | null;
  onUpdateTournament: (updatedTournament: Tournament) => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onEditStart: (
    type: "timer" | "overtimer",
    part: "minutes" | "seconds"
  ) => void;
  onEditComplete: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  setEditingField: Dispatch<
    SetStateAction<{
      type: "timer" | "overtimer" | "name";
      part?: "minutes" | "seconds";
      value: string;
    } | null>
  >;
}

export function TournamentSettingsSection({
  tournament,
  isPublishing,
  isUnpublishing,
  editingField,
  onUpdateTournament,
  onPublish,
  onUnpublish,
  onEditStart,
  onEditComplete,
  onKeyDown,
  setEditingField,
}: TournamentSettingsSectionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingField(
      (
        prev: {
          type: "timer" | "overtimer" | "name";
          part?: "minutes" | "seconds";
          value: string;
        } | null
      ) =>
        prev
          ? {
              ...prev,
              value: e.target.value,
            }
          : null
    );
  };

  const session = useSession();
  const isLoggedIn = session.status === "authenticated";

  return (
    <section className="bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20 rounded-t-xl flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Tournament Settings</h2>
        {isLoggedIn && (
          <>
            {!tournament.isActive ? (
              <button
                onClick={onPublish}
                disabled={isPublishing}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? "Publishing..." : "Publish Tournament"}
              </button>
            ) : (
              <button
                onClick={onUnpublish}
                disabled={isUnpublishing}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnpublishing ? "Unpublishing..." : "Unpublish Tournament"}
              </button>
            )}
          </>
        )}
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-white font-medium">Tournament Name</label>
          <div className="flex items-center gap-2">
            {editingField?.type === "name" ? (
              <input
                type="text"
                value={editingField.value}
                onChange={handleChange}
                onBlur={() => {
                  if (editingField?.value.trim()) {
                    onUpdateTournament({
                      ...tournament,
                      name: editingField.value.trim(),
                    });
                  }
                  setEditingField(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editingField?.value.trim()) {
                    onUpdateTournament({
                      ...tournament,
                      name: editingField.value.trim(),
                    });
                    setEditingField(null);
                  }
                }}
                className="bg-slate-700 text-white rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            ) : (
              <div
                className="flex items-center gap-1 cursor-pointer hover:bg-slate-700/50 px-3 py-1 rounded transition-colors"
                onClick={() =>
                  setEditingField({ type: "name", value: tournament.name })
                }
              >
                <span className="text-white">{tournament.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-white font-medium">Enable Timer</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tournament.config?.enableTimer}
              onChange={(e) => {
                onUpdateTournament({
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
                onClick={() => onEditStart("timer", "minutes")}
              >
                {editingField?.type === "timer" &&
                editingField?.part === "minutes" ? (
                  <input
                    type="number"
                    value={editingField.value}
                    onChange={(e) =>
                      setEditingField(
                        (
                          prev: {
                            type: "timer" | "overtimer" | "name";
                            part?: "minutes" | "seconds";
                            value: string;
                          } | null
                        ) => (prev ? { ...prev, value: e.target.value } : null)
                      )
                    }
                    onBlur={onEditComplete}
                    onKeyDown={onKeyDown}
                    className="bg-slate-700 text-white rounded px-3 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    autoFocus
                  />
                ) : (
                  <span className="text-white font-mono">
                    {Math.floor((tournament.config?.timerDuration ?? 300) / 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                )}
              </div>
              <span className="text-white">:</span>
              <div
                className="flex items-center gap-1 cursor-pointer hover:bg-slate-700/50 px-3 py-1 rounded transition-colors"
                onClick={() => onEditStart("timer", "seconds")}
              >
                {editingField?.type === "timer" &&
                editingField?.part === "seconds" ? (
                  <input
                    type="number"
                    value={editingField.value}
                    onChange={(e) =>
                      setEditingField(
                        (
                          prev: {
                            type: "timer" | "overtimer" | "name";
                            part?: "minutes" | "seconds";
                            value: string;
                          } | null
                        ) => (prev ? { ...prev, value: e.target.value } : null)
                      )
                    }
                    onBlur={onEditComplete}
                    onKeyDown={onKeyDown}
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
                onUpdateTournament({
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
                      setEditingField(
                        (
                          prev: {
                            type: "timer" | "overtimer" | "name";
                            part?: "minutes" | "seconds";
                            value: string;
                          } | null
                        ) => (prev ? { ...prev, value: e.target.value } : null)
                      )
                    }
                    onBlur={onEditComplete}
                    onKeyDown={onKeyDown}
                    className="bg-slate-700 text-white rounded px-3 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-white font-mono px-3 py-1 rounded"
                    onClick={() => onEditStart("overtimer", "minutes")}
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
                      setEditingField(
                        (
                          prev: {
                            type: "timer" | "overtimer" | "name";
                            part?: "minutes" | "seconds";
                            value: string;
                          } | null
                        ) => (prev ? { ...prev, value: e.target.value } : null)
                      )
                    }
                    onBlur={onEditComplete}
                    onKeyDown={onKeyDown}
                    className="bg-slate-700 text-white rounded px-3 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    max="59"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-white font-mono px-3 py-1 rounded"
                    onClick={() => onEditStart("overtimer", "seconds")}
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
  );
}
