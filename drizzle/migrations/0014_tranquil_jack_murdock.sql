CREATE TABLE "profile_visits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profile_visits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"instructor_id" integer NOT NULL,
	"visitor_ip" varchar(45),
	"visited_at" timestamp,
	"year_month" varchar(7) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_visits" ADD CONSTRAINT "profile_visits_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;