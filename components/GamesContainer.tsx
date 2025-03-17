"use client";

import { useState, useRef, useEffect } from "react";
import { generateBalancedTeams } from "@/utils/generateTeams";
import { Game, Player } from "@/types/game";
import { PlayerStats } from "./PlayerStats";
import { GamesList } from "./GamesList";
import { PlusIcon } from "./icons/PlusIcon";
import { ErrorModal } from "./ErrorModal";
import { Scoreboard } from "./Scoreboard";

const INITIAL_PLAYERS: Player[] = [
  { name: "Alice", id: 1, isEnabled: true },
  { name: "Bob", id: 2, isEnabled: true },
  { name: "Charlie", id: 3, isEnabled: true },
  { name: "David", id: 4, isEnabled: true },
  { name: "Eve", id: 5, isEnabled: true },
  { name: "Frank", id: 6, isEnabled: true },
  { name: "Grace", id: 7, isEnabled: true },
  { name: "Hank", id: 8, isEnabled: true },
  { name: "Ian", id: 9, isEnabled: true },
  { name: "Jack", id: 10, isEnabled: true },
];

// Initialize empty games played record
const initialGamesPlayed = INITIAL_PLAYERS.reduce((acc, player) => {
  acc[player.id] = 0;
  return acc;
}, {} as Record<number, number>);

export function GamesContainer() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [games, setGames] = useState<Game[]>(() => {
    const generatedGames = generateBalancedTeams(
      players.filter((p) => p.isEnabled),
      0
    );
    return generatedGames.map((game) => ({
      ...game,
      teams: game.teams.map((team) => ({
        ...team,
        score: 0,
      })),
    }));
  });
  const [gamesPlayed, setGamesPlayed] =
    useState<Record<number, number>>(initialGamesPlayed);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pairingTracker = useRef(new Set<string>());
  const nextPlayerId = useRef(Math.max(...players.map((p) => p.id)) + 1);

  // Initialize pairingTracker and calculate games played
  useEffect(() => {
    // Reset pairing tracker
    pairingTracker.current.clear();

    // Initialize pairingTracker with existing games
    games.forEach((game) => {
      game.teams.forEach((team) => {
        const teamKey = team.players
          .map((p) => p.id)
          .sort((a, b) => a - b)
          .join("-");
        pairingTracker.current.add(teamKey);
      });
    });

    // Calculate games played for each player
    const newGamesPlayed = players.reduce((acc, player) => {
      acc[player.id] = games.reduce((count, game) => {
        const isPlaying = game.teams.some((team) =>
          team.players.some((p) => p.id === player.id)
        );
        return count + (isPlaying ? 1 : 0);
      }, 0);
      return acc;
    }, {} as Record<number, number>);

    setGamesPlayed(newGamesPlayed);
  }, [games, players]);

  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: nextPlayerId.current,
      name,
      isEnabled: true,
    };
    nextPlayerId.current += 1;
    setPlayers([...players, newPlayer]);
    setGamesPlayed((prev) => ({ ...prev, [newPlayer.id]: 0 }));
  };

  const handleDeletePlayer = (playerId: number) => {
    if (gamesPlayed[playerId] > 0) return;
    setPlayers((currentPlayers) =>
      currentPlayers.filter((p) => p.id !== playerId)
    );
  };

  const handleDeleteGame = (index: number) => {
    setGames((currentGames) => currentGames.filter((_, i) => i !== index));
  };

  const handleRenamePlayer = (playerId: number, newName: string) => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === playerId ? { ...player, name: newName } : player
      )
    );
  };

  const togglePlayerEnabled = (playerId: number) => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === playerId
          ? { ...player, isEnabled: !player.isEnabled }
          : player
      )
    );
  };

  const handleScoreChange = (
    gameIndex: number,
    teamIndex: number,
    newScore: number
  ) => {
    setGames((currentGames) =>
      currentGames.map((game, i) =>
        i === gameIndex
          ? {
              ...game,
              teams: game.teams.map((team, j) =>
                j === teamIndex ? { ...team, score: newScore } : team
              ),
            }
          : game
      )
    );
  };

  const addNewGame = () => {
    const enabledPlayers = players.filter((p) => p.isEnabled);
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

    setGames([...games, newGame]);
  };

  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
      <Scoreboard players={players} games={games} />

      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Teams</h1>
          <button
            onClick={addNewGame}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            Add Game
          </button>
        </div>

        <PlayerStats
          players={players}
          gamesPlayed={gamesPlayed}
          onToggleEnabled={togglePlayerEnabled}
          onRenamePlayer={handleRenamePlayer}
          onAddPlayer={handleAddPlayer}
          onDeletePlayer={handleDeletePlayer}
        />
      </div>

      <GamesList
        games={games}
        onDeleteGame={handleDeleteGame}
        onScoreChange={handleScoreChange}
      />

      <ErrorModal
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ""}
      />
    </main>
  );
}
