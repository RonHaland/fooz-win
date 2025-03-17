import { Player, Team, Game } from "@/types/game";

export function generateBalancedTeams(
  players: Player[],
  games: number
): Game[] {
  const enabledPlayers = players.filter((p) => p.isEnabled);
  if (enabledPlayers.length < 4) {
    throw new Error(
      "At least 4 enabled players are required to form 2v2 teams."
    );
  }

  const results: Game[] = [];

  for (let game = 0; game < games; game++) {
    const pairingTracker: Set<string> = new Set(); // Reset tracker for each game
    const shuffledPlayers = [...enabledPlayers].sort(() => Math.random() - 0.5);
    const gameTeams: Team[] = [];

    // Take first 4 players for the game, rest sit out
    let playingPlayers = shuffledPlayers.splice(0, 4);
    const sittingOut = shuffledPlayers;

    let attempts = 0;
    // Create 2v2 teams
    while (playingPlayers.length === 4 && attempts < 100) {
      const team1 = [playingPlayers.pop()!, playingPlayers.pop()!];
      const team2 = [playingPlayers.pop()!, playingPlayers.pop()!];

      const team1Key = team1
        .map((p) => p.id)
        .sort((a, b) => a - b)
        .join("-");
      const team2Key = team2
        .map((p) => p.id)
        .sort((a, b) => a - b)
        .join("-");

      if (!pairingTracker.has(team1Key) && !pairingTracker.has(team2Key)) {
        gameTeams.push({ players: team1 }, { players: team2 });
        pairingTracker.add(team1Key);
        pairingTracker.add(team2Key);
        break;
      } else {
        // Restore players and shuffle again if pairings are repeated
        playingPlayers = [...team1, ...team2].sort(() => Math.random() - 0.5);
        attempts++;
      }
    }

    if (gameTeams.length < 2) {
      // If we couldn't make valid teams due to pairing constraints,
      // just use the current arrangement of players
      const team1 = [playingPlayers[0], playingPlayers[1]];
      const team2 = [playingPlayers[2], playingPlayers[3]];
      gameTeams.push({ players: team1 }, { players: team2 });
    }

    results.push({
      teams: gameTeams,
      ...(sittingOut.length > 0 && { sittingOut }),
    });
  }

  return results;
}
