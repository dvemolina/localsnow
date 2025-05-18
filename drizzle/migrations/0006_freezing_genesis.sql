CREATE TYPE "public"."sport" AS ENUM('Ski', 'Snowboard', 'Telemark');--> statement-breakpoint
ALTER TABLE "sports" RENAME COLUMN "name" TO "sport";--> statement-breakpoint
ALTER TABLE "sports" RENAME COLUMN "slug" TO "sport_slug";--> statement-breakpoint
ALTER TABLE "sports" DROP CONSTRAINT "sports_slug_unique";--> statement-breakpoint
ALTER TABLE "sports" ADD CONSTRAINT "sports_sport_unique" UNIQUE("sport");--> statement-breakpoint
ALTER TABLE "sports" ADD CONSTRAINT "sports_sport_slug_unique" UNIQUE("sport_slug");