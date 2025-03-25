"use client";

import { Tournament } from "@/types/game";
import { PlayerStats } from "@/components/PlayerStats";
import { gamesPlayed } from "@/utils/tournament";
interface PlayerManagementSectionProps {
  tournament: Tournament;
  onUpdateTournament: (updatedTournament: Tournament) => void;
}

export function PlayerManagementSection({
  tournament,
  onUpdateTournament,
}: PlayerManagementSectionProps) {
  return (
    <section className="bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20 rounded-t-xl">
        <h2 className="text-2xl font-bold text-white">Player Management</h2>
      </div>
      <PlayerStats
        players={tournament.players}
        gamesPlayed={gamesPlayed(tournament.games)}
        onToggleEnabled={(playerId: string) => {
          onUpdateTournament({
            ...tournament,
            players: tournament.players.map((player) =>
              player.id === playerId
                ? { ...player, isEnabled: !player.isEnabled }
                : player
            ),
          });
        }}
        onRenamePlayer={(playerId: string, newName: string) => {
          onUpdateTournament({
            ...tournament,
            players: tournament.players.map((player) =>
              player.id === playerId ? { ...player, name: newName } : player
            ),
          });
        }}
        onAddPlayer={(name: string) => {
          const newPlayer = {
            id: crypto.randomUUID(),
            name,
            isEnabled: true,
          };
          onUpdateTournament({
            ...tournament,
            players: [...tournament.players, newPlayer],
          });
        }}
        onDeletePlayer={(playerId: string) => {
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
            return "Cannot delete player who has played games";
          }

          onUpdateTournament({
            ...tournament,
            players: tournament.players.filter((p) => p.id !== playerId),
          });
          return null;
        }}
      />
    </section>
  );
}
