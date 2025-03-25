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
  tournamentConfig,
} from "@/db/schema";
import { and, eq, or, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { Tournament, TournamentShortInfo } from "@/types/game";
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
        isPublic: tournaments.isPublic,
        ownerId: tournaments.ownerId,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      })
      .from(tournaments)
      .where(eq(tournaments.id, tournament.id))
      .limit(1);

    //#region EXISTING TOURNAMENT
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
          isPublic: tournament.isPublic,
          updatedAt: new Date(),
        })
        .where(eq(tournaments.id, tournament.id));

      await db
        .update(tournamentConfig)
        .set({
          enableTimer: tournament.config?.enableTimer ?? true,
          timerDuration: tournament.config?.timerDuration ?? 360,
          enableOvertimer: tournament.config?.enableOvertimer ?? true,
          overtimerDuration: tournament.config?.overtimerDuration ?? 120,
          updatedAt: new Date(),
        })
        .where(eq(tournamentConfig.tournamentId, tournament.id));

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
      for (const existingGame of existingGames) {
        if (!tournament.games.find((g) => g.id === existingGame.id)) {
          await db.delete(games).where(eq(games.id, existingGame.id));
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
        if (existingAdmins.find((a) => a.userId === admin.id)) {
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
      for (const existingAdmin of existingAdmins) {
        if (!tournament.admins.find((a) => a.id === existingAdmin.userId)) {
          await db
            .delete(tournamentAdmins)
            .where(eq(tournamentAdmins.id, existingAdmin.id));
        }
      }

      const existingUsers = await db
        .select()
        .from(tournamentUsers)
        .where(eq(tournamentUsers.tournamentId, tournament.id));

      for (const user of tournament.users) {
        if (existingUsers.find((u) => u.userId === user.id)) {
          console.log("updating user", user.id);
          await db
            .update(tournamentUsers)
            .set({
              userId: user.id,
            })
            .where(eq(tournamentUsers.userId, user.id));
        } else {
          console.log("inserting user", user.id);
          await db.insert(tournamentUsers).values({
            tournamentId: tournament.id,
            userId: user.id,
          });
        }
      }
      for (const existingUser of existingUsers) {
        if (!tournament.users.find((u) => u.id === existingUser.userId)) {
          await db
            .delete(tournamentUsers)
            .where(eq(tournamentUsers.id, existingUser.id));
        }
      }
      return { success: true };
    }
    //#endregion
    //#region NEW TOURNAMENT
    await db.insert(tournaments).values({
      id: tournament.id,
      name: tournament.name,
      createdBy: session.user.id,
      ownerId: session.user.id,
      isActive: true,
      isPublic: tournament.isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(tournamentConfig).values({
      tournamentId: tournament.id,
      enableTimer: tournament.config?.enableTimer ?? true,
      timerDuration: tournament.config?.timerDuration ?? 360,
      enableOvertimer: tournament.config?.enableOvertimer ?? true,
      overtimerDuration: tournament.config?.overtimerDuration ?? 120,
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
    //#endregion
  } catch (error) {
    console.error("Error publishing tournament:", error);
    return { success: false, error: "Failed to publish tournament" };
  }
}

export async function getPublishedTournament(
  id: string
): Promise<Tournament | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? crypto.randomUUID();
  try {
    const [tournament] = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        isActive: tournaments.isActive,
        isPublic: tournaments.isPublic,
        ownerId: tournaments.ownerId,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
        config: tournamentConfig,
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
      .leftJoin(
        tournamentConfig,
        eq(tournamentConfig.tournamentId, tournaments.id)
      )
      .where(
        and(
          eq(tournaments.id, id),
          or(
            eq(tournaments.ownerId, userId),
            eq(tournamentAdmins.userId, userId),
            eq(tournamentUsers.userId, userId),
            eq(tournaments.isPublic, true)
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

    return {
      ...tournament,
      ownerId: tournament.ownerId ?? "",
      config: tournament.config ?? undefined,
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: tournament.updatedAt.toISOString(),
      players: tournamentPlayers.map((player) => ({
        id: player.id,
        name: player.name,
        isEnabled: player.isEnabled,
      })),
      games: tournamentGames.map((game) => {
        const team1 = tournamentPlayers.filter(
          (player) =>
            player.id === game.team1Player1Id ||
            player.id === game.team1Player2Id
        );
        const team2 = tournamentPlayers.filter(
          (player) =>
            player.id === game.team2Player1Id ||
            player.id === game.team2Player2Id
        );
        return {
          id: game.id,
          teams: [
            { players: team1, score: game.team1Score },
            { players: team2, score: game.team2Score },
          ],
        };
      }),
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

export async function deleteTournament(tournamentId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1);
    if (!tournament) {
      return { success: false, error: "Tournament not found" };
    }
    if (tournament.ownerId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(games).where(eq(games.tournamentId, tournamentId));
    await db.delete(players).where(eq(players.tournamentId, tournamentId));
    await db
      .delete(tournamentAdmins)
      .where(eq(tournamentAdmins.tournamentId, tournamentId));
    await db
      .delete(tournamentUsers)
      .where(eq(tournamentUsers.tournamentId, tournamentId));

    await db
      .delete(tournamentConfig)
      .where(eq(tournamentConfig.tournamentId, tournamentId));

    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return { success: false, error: "Failed to delete tournament" };
  }
}

export async function getPublishedTournaments(): Promise<
  TournamentShortInfo[]
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return [];
    }
    const publishedTournaments = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.ownerId, session.user.id))
      .orderBy(desc(tournaments.createdAt));

    return publishedTournaments.map((tournament) => ({
      id: tournament.id,
      name: tournament.name,
      isPublic: tournament.isPublic,
      createdAt: tournament.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  }
}

export async function getPublicTournaments(
  page: number = 1,
  limit: number = 10
): Promise<{
  tournaments: TournamentShortInfo[];
  totalPages: number;
}> {
  try {
    const offset = (page - 1) * limit;

    const [total] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tournaments)
      .where(eq(tournaments.isPublic, true));

    const publicTournaments = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        createdAt: tournaments.createdAt,
        ownerId: tournaments.ownerId,
        ownerName: users.name,
      })
      .from(tournaments)
      .leftJoin(users, eq(tournaments.ownerId, users.id))
      .where(eq(tournaments.isPublic, true))
      .orderBy(desc(tournaments.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      tournaments: publicTournaments.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        ownerName: t.ownerName ?? "",
      })),
      totalPages: Math.ceil(total.count / limit),
    };
  } catch (error) {
    console.error("Error fetching public tournaments:", error);
    return { tournaments: [], totalPages: 1 };
  }
}
