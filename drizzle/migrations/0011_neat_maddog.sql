ALTER TABLE "instructor_sports" DROP CONSTRAINT "instructor_sports_instructor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "instructor_sports" ADD CONSTRAINT "instructor_sports_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;