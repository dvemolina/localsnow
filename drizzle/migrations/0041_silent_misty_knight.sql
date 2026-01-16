CREATE TYPE "public"."booking_source" AS ENUM('platform', 'manual');--> statement-breakpoint
CREATE TABLE "instructor_reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "instructor_reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"instructor_id" integer NOT NULL,
	"booking_id" integer,
	"client_name" varchar(100),
	"client_email" varchar(255),
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "instructor_reviews_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "lesson_id" integer;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "source" "booking_source" DEFAULT 'platform' NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "manual_price" integer;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "review_token" varchar(255);--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "review_submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "instructor_reviews" ADD CONSTRAINT "instructor_reviews_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_reviews" ADD CONSTRAINT "instructor_reviews_booking_id_booking_requests_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;