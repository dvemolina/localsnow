CREATE TABLE "booking_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "booking_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"instructor_id" integer NOT NULL,
	"client_name" varchar(100) NOT NULL,
	"client_email" varchar(255) NOT NULL,
	"client_phone" varchar(50),
	"preferred_date" timestamp NOT NULL,
	"lesson_type" varchar(100),
	"number_of_people" integer DEFAULT 1,
	"skill_level" varchar(50),
	"message" text,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "booking_requests_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "resorts" ALTER COLUMN "lat" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "resorts" ALTER COLUMN "lon" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;