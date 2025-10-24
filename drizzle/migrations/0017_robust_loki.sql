ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_id_unique" CASCADE;
ALTER TABLE "lessons" ADD COLUMN "uuid" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_uuid_unique" UNIQUE("uuid");