-- Drop existing tables if they exist
DROP TABLE IF EXISTS "promo_codes" CASCADE;
DROP TABLE IF EXISTS "duration_packages" CASCADE;
DROP TABLE IF EXISTS "group_pricing_tiers" CASCADE;
DROP TABLE IF EXISTS "booking_request_sports" CASCADE;

-- Drop sequences if they exist
DROP SEQUENCE IF EXISTS "duration_packages_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "group_pricing_tiers_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "promo_codes_id_seq" CASCADE;

-- Now create the tables
CREATE TABLE "duration_packages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "duration_packages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"lesson_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"hours" numeric(4, 1) NOT NULL,
	"price" integer NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);

CREATE TABLE "group_pricing_tiers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "group_pricing_tiers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"lesson_id" integer NOT NULL,
	"min_students" integer NOT NULL,
	"max_students" integer NOT NULL,
	"price_per_hour" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);

CREATE TABLE "promo_codes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "promo_codes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"instructor_id" integer,
	"lesson_id" integer,
	"code" varchar(50) NOT NULL,
	"discount_percent" integer NOT NULL,
	"valid_until" timestamp,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);

CREATE TABLE "booking_request_sports" (
	"booking_request_id" integer NOT NULL,
	"sport_id" integer NOT NULL
);

-- Alter booking_requests table
ALTER TABLE "booking_requests" RENAME COLUMN "number_of_people" TO "number_of_students";
ALTER TABLE "booking_requests" RENAME COLUMN "preferred_date" TO "start_date";
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "end_date" timestamp;
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "hours_per_day" numeric(4, 1) DEFAULT 1 NOT NULL;
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "promo_code" varchar(50);
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "estimated_price" integer;
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "currency" varchar(50);
ALTER TABLE "booking_requests" DROP COLUMN IF EXISTS "lesson_type";

-- Add foreign keys
ALTER TABLE "duration_packages" ADD CONSTRAINT "duration_packages_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "group_pricing_tiers" ADD CONSTRAINT "group_pricing_tiers_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "booking_request_sports" ADD CONSTRAINT "booking_request_sports_booking_request_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "booking_request_sports" ADD CONSTRAINT "booking_request_sports_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE cascade ON UPDATE no action;