import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ownerId: uuid("owner_id").references(() => users.id),
});

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .references(() => tournaments.id)
    .notNull(),
  name: text("name").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .references(() => tournaments.id)
    .notNull(),
  team1Player1Id: uuid("team1_player1_id")
    .references(() => players.id)
    .notNull(),
  team1Player2Id: uuid("team1_player2_id")
    .references(() => players.id)
    .notNull(),
  team2Player1Id: uuid("team2_player1_id")
    .references(() => players.id)
    .notNull(),
  team2Player2Id: uuid("team2_player2_id")
    .references(() => players.id)
    .notNull(),
  team1Score: integer("team1_score").notNull(),
  team2Score: integer("team2_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tournamentAdmins = pgTable("tournament_admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .references(() => tournaments.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
});

export const tournamentUsers = pgTable("tournament_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .references(() => tournaments.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
});

export const tournamentConfig = pgTable("tournament_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .references(() => tournaments.id)
    .notNull(),
  enableTimer: boolean("enable_timer").default(true).notNull(),
  timerDuration: integer("timer_duration").notNull(),
  enableOvertimer: boolean("enable_overtimer").default(true).notNull(),
  overtimerDuration: integer("overtimer_duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
