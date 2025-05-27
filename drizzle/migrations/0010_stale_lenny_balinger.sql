ALTER TABLE "instructor_resorts" DROP CONSTRAINT "instructor_resorts_instructor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "school_instructors" DROP CONSTRAINT "school_instructors_instructor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "country_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "instructor_resorts" ADD CONSTRAINT "instructor_resorts_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD CONSTRAINT "school_instructors_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;