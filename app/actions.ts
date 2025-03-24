"use server";

import { createUser } from "@/utils/auth";
import { db } from "@/db";
import {
  tournaments,
  players,
  games,
  users,
  tournamentAdmins,
  tournamentUsers,
} from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { Tournament } from "@/types/game";
import { isUUID } from "@/utils/storage";

type PublishResult = {
  success: boolean;
  error?: string;
};

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const user = await createUser(name, email, password);
    return { success: true, user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An error occurred during registration" };
  }
}

export async function findUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user[0];
}

export async function publishTournament(
  tournament: Tournament
): Promise<PublishResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if tournament exists
    const existingTournament = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        isActive: tournaments.isActive,
        ownerId: tournaments.ownerId,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      })
      .from(tournaments)
      .where(eq(tournaments.id, tournament.id))
      .limit(1);

    if (existingTournament.length > 0) {
      if (existingTournament[0].ownerId !== session.user.id) {
        return { success: false, error: "Unauthorized" };
      }
      // Update existing tournament
      await db
        .update(tournaments)
        .set({
          name: tournament.name,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(tournaments.id, tournament.id));

      const existingGames = await db
        .select()
        .from(games)
        .where(eq(games.tournamentId, tournament.id));

      for (const game of tournament.games) {
        if (existingGames.find((g) => g.id === game.id)) {
          await db
            .update(games)
            .set({
              team1Player1Id: game.teams[0].players[0].id,
              team1Player2Id: game.teams[0].players[1].id,
              team2Player1Id: game.teams[1].players[0].id,
              team2Player2Id: game.teams[1].players[1].id,
              team1Score: game.teams[0].score,
              team2Score: game.teams[1].score,
              updatedAt: new Date(),
            })
            .where(eq(games.id, game.id));
        } else {
          await db.insert(games).values({
            id: game.id,
            tournamentId: tournament.id,
            team1Player1Id: game.teams[0].players[0].id,
            team1Player2Id: game.teams[0].players[1].id,
            team2Player1Id: game.teams[1].players[0].id,
            team2Player2Id: game.teams[1].players[1].id,
            team1Score: game.teams[0].score,
            team2Score: game.teams[1].score,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      const existingPlayers = await db
        .select()
        .from(players)
        .where(eq(players.tournamentId, tournament.id));

      for (const player of tournament.players) {
        if (existingPlayers.find((p) => p.id === player.id)) {
          await db
            .update(players)
            .set({
              name: player.name,
              isEnabled: player.isEnabled,
              updatedAt: new Date(),
            })
            .where(eq(players.id, player.id));
        } else {
          await db.insert(players).values({
            id: player.id,
            tournamentId: tournament.id,
            name: player.name,
            isEnabled: player.isEnabled,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      const existingAdmins = await db
        .select()
        .from(tournamentAdmins)
        .where(eq(tournamentAdmins.tournamentId, tournament.id));

      for (const admin of tournament.admins) {
        if (existingAdmins.find((a) => a.id === admin.id)) {
          await db
            .update(tournamentAdmins)
            .set({
              userId: admin.id,
            })
            .where(eq(tournamentAdmins.id, admin.id));
        } else {
          await db.insert(tournamentAdmins).values({
            tournamentId: tournament.id,
            userId: admin.id,
          });
        }
      }
      const existingUsers = await db
        .select()
        .from(tournamentUsers)
        .where(eq(tournamentUsers.tournamentId, tournament.id));

      for (const user of tournament.users) {
        if (existingUsers.find((u) => u.id === user.id)) {
          await db
            .update(tournamentUsers)
            .set({
              userId: user.id,
            })
            .where(eq(tournamentUsers.id, user.id));
        } else {
          await db.insert(tournamentUsers).values({
            tournamentId: tournament.id,
            userId: user.id,
          });
        }
      }
      return { success: true };
    }

    // Insert new tournament
    await db.insert(tournaments).values({
      id: tournament.id,
      name: tournament.name,
      createdBy: session.user.id,
      ownerId: session.user.id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedPlayerMap = new Map<string, string>(); // map of old player id to new player id
    tournament = {
      ...tournament,
      players: tournament.players.map((player) => {
        const existingId = player.id;
        player.id = isUUID(player.id) ? player.id : crypto.randomUUID();
        updatedPlayerMap.set(existingId, player.id);
        return player;
      }),
      games: tournament.games.map((game) => {
        game.teams = game.teams.map((team) => {
          team.players = team.players.map((player) => {
            player.id = updatedPlayerMap.get(player.id) ?? player.id;
            return player;
          });
          return team;
        });
        return game;
      }),
    };

    // Insert players
    for (const player of tournament.players) {
      await db.insert(players).values({
        tournamentId: tournament.id,
        name: player.name,
        isEnabled: player.isEnabled,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: player.id,
      });
    }

    // Insert games
    for (const game of tournament.games) {
      if (game.teams.length !== 2) continue; // Skip invalid games

      const team1 = game.teams[0];
      const team2 = game.teams[1];

      if (team1 && team2) {
        await db.insert(games).values({
          tournamentId: tournament.id,
          team1Player1Id: team1.players[0].id,
          team1Player2Id: team1.players[1].id,
          team2Player1Id: team2.players[0].id,
          team2Player2Id: team2.players[1].id,
          team1Score: team1.score,
          team2Score: team2.score,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    for (const admin of tournament.admins) {
      await db.insert(tournamentAdmins).values({
        tournamentId: tournament.id,
        userId: admin.id,
      });
    }

    for (const user of tournament.users) {
      await db.insert(tournamentUsers).values({
        tournamentId: tournament.id,
        userId: user.id,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error publishing tournament:", error);
    return { success: false, error: "Failed to publish tournament" };
  }
}

export async function getPublishedTournament(
  id: string
): Promise<Tournament | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  try {
    const [tournament] = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        isActive: tournaments.isActive,
        ownerId: tournaments.ownerId,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      })
      .from(tournaments)
      .leftJoin(
        tournamentAdmins,
        eq(tournamentAdmins.tournamentId, tournaments.id)
      )
      .leftJoin(
        tournamentUsers,
        eq(tournamentUsers.tournamentId, tournaments.id)
      )
      .where(
        and(
          eq(tournaments.id, id),
          or(
            eq(tournaments.ownerId, session.user.id),
            eq(tournamentAdmins.userId, session.user.id),
            eq(tournamentUsers.userId, session.user.id)
          )
        )
      )
      .limit(1);

    if (!tournament) return null;

    // Get players
    const tournamentPlayers = await db
      .select()
      .from(players)
      .where(eq(players.tournamentId, id));

    // Get games
    const tournamentGames = await db
      .select({
        id: games.id,
        team1Player1Id: games.team1Player1Id,
        team1Player2Id: games.team1Player2Id,
        team2Player1Id: games.team2Player1Id,
        team2Player2Id: games.team2Player2Id,
        team1Score: games.team1Score,
        team2Score: games.team2Score,
      })
      .from(games)
      .where(eq(games.tournamentId, id));

    const admins = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(tournamentAdmins)
      .leftJoin(users, eq(tournamentAdmins.userId, users.id))
      .where(eq(tournamentAdmins.tournamentId, id));

    const tournamentUsersFromDb = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(tournamentUsers)
      .leftJoin(users, eq(tournamentUsers.userId, users.id))
      .where(eq(tournamentUsers.tournamentId, id));

    const team1 = tournamentPlayers.filter(
      (player) =>
        player.id === tournamentGames[0].team1Player1Id ||
        player.id === tournamentGames[0].team1Player2Id
    );
    const team2 = tournamentPlayers.filter(
      (player) =>
        player.id === tournamentGames[0].team2Player1Id ||
        player.id === tournamentGames[0].team2Player2Id
    );

    return {
      ...tournament,
      ownerId: tournament.ownerId ?? "",
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: tournament.updatedAt.toISOString(),
      players: tournamentPlayers.map((player) => ({
        id: player.id,
        name: player.name,
        isEnabled: player.isEnabled,
      })),
      games: tournamentGames.map((game) => ({
        id: game.id,
        teams: [
          { players: team1, score: game.team1Score },
          { players: team2, score: game.team2Score },
        ],
      })),
      admins: admins.map((admin) => ({
        id: admin.id ?? "",
        name: admin.name ?? "",
        email: admin.email ?? "",
      })),
      users: tournamentUsersFromDb.map((user) => ({
        id: user.id ?? "",
        name: user.name ?? "",
        email: user.email ?? "",
      })),
    };
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return null;
  }
}

export async function deleteTournament(tournament: Tournament) {
  try {
    await db.delete(games).where(eq(games.tournamentId, tournament.id));
    await db.delete(players).where(eq(players.tournamentId, tournament.id));
    await db
      .delete(tournamentAdmins)
      .where(eq(tournamentAdmins.tournamentId, tournament.id));
    await db
      .delete(tournamentUsers)
      .where(eq(tournamentUsers.tournamentId, tournament.id));

    await db.delete(tournaments).where(eq(tournaments.id, tournament.id));

    return { success: true };
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return { success: false, error: "Failed to delete tournament" };
  }
}
