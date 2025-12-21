CREATE TYPE "public"."lesson_source" AS ENUM('manual', 'marketplace');--> statement-breakpoint
CREATE TABLE "instructor_lessons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "instructor_lessons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"instructor_id" integer NOT NULL,
	"client_name" varchar(100) NOT NULL,
	"client_email" varchar(255) NOT NULL,
	"client_country_code" varchar(4),
	"client_phone" varchar(50),
	"lesson_date" timestamp with time zone NOT NULL,
	"duration" numeric(4, 1) NOT NULL,
	"number_of_students" integer DEFAULT 1 NOT NULL,
	"sport" varchar(50),
	"skill_level" varchar(50),
	"resort_id" integer,
	"resort_name" varchar(100),
	"instructor_notes" text,
	"source" "lesson_source" DEFAULT 'manual' NOT NULL,
	"booking_request_id" integer,
	"review_request_sent" boolean DEFAULT false NOT NULL,
	"review_request_sent_at" timestamp with time zone,
	"review_token" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "instructor_lessons_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "instructor_lessons_booking_request_id_unique" UNIQUE("booking_request_id"),
	CONSTRAINT "instructor_lessons_review_token_unique" UNIQUE("review_token")
);
--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "booking_request_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "instructor_lesson_id" integer;--> statement-breakpoint
ALTER TABLE "instructor_lessons" ADD CONSTRAINT "instructor_lessons_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_lessons" ADD CONSTRAINT "instructor_lessons_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_lessons" ADD CONSTRAINT "instructor_lessons_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_instructor_lesson_id_instructor_lessons_id_fk" FOREIGN KEY ("instructor_lesson_id") REFERENCES "public"."instructor_lessons"("id") ON DELETE set null ON UPDATE no action;