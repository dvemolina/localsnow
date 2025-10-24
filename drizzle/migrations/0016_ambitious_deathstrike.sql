CREATE TABLE "lesson_sports" (
	"lesson_id" integer NOT NULL,
	"sport_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_visits" RENAME COLUMN "visited_at" TO "created_at";--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_sport_id_sports_id_fk";
--> statement-breakpoint
ALTER TABLE "profile_visits" DROP CONSTRAINT "profile_visits_instructor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profile_visits" ALTER COLUMN "visitor_ip" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_sports" ADD CONSTRAINT "lesson_sports_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_sports" ADD CONSTRAINT "lesson_sports_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "sport_id";