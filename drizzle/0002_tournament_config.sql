CREATE TABLE "tournament_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"enable_timer" boolean DEFAULT true NOT NULL,
	"timer_duration" integer NOT NULL,
	"enable_overtimer" boolean DEFAULT true NOT NULL,
	"overtimer_duration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tournament_config" ADD CONSTRAINT "tournament_config_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;