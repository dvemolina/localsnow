-- Migration: Add client management system features for booking requests and instructor reviews

-- Add booking source enum
DO $$ BEGIN
    CREATE TYPE booking_source AS ENUM ('platform', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enhance booking_requests table for client management
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "source" booking_source DEFAULT 'platform' NOT NULL;
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "manual_price" integer;
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "review_token" varchar(255) UNIQUE;
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "review_submitted_at" timestamp;

-- Add lesson_id reference for manual bookings (to track which lesson/service it's for)
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "lesson_id" integer REFERENCES "lessons"("id") ON DELETE SET NULL;

-- Create instructor_reviews table
CREATE TABLE IF NOT EXISTS "instructor_reviews" (
    "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "uuid" uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    "instructor_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "booking_id" integer REFERENCES "booking_requests"("id") ON DELETE SET NULL,
    "client_name" varchar(100),
    "client_email" varchar(255),
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" text,
    "is_verified" boolean DEFAULT false NOT NULL,
    "is_published" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp,
    "deleted_at" timestamp
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_booking_requests_source" ON "booking_requests"("source");
CREATE INDEX IF NOT EXISTS "idx_booking_requests_review_token" ON "booking_requests"("review_token");
CREATE INDEX IF NOT EXISTS "idx_instructor_reviews_instructor_id" ON "instructor_reviews"("instructor_id");
CREATE INDEX IF NOT EXISTS "idx_instructor_reviews_booking_id" ON "instructor_reviews"("booking_id");
CREATE INDEX IF NOT EXISTS "idx_instructor_reviews_is_published" ON "instructor_reviews"("is_published");

-- Add comment for documentation
COMMENT ON COLUMN "booking_requests"."source" IS 'Source of the booking: platform (from LocalSnow) or manual (added by instructor)';
COMMENT ON COLUMN "booking_requests"."manual_price" IS 'Manual price for offline bookings (when instructor adds client manually)';
COMMENT ON COLUMN "booking_requests"."notes" IS 'Private notes for instructor about this booking/client';
COMMENT ON COLUMN "booking_requests"."review_token" IS 'Unique token for generating review submission link';
COMMENT ON COLUMN "booking_requests"."review_submitted_at" IS 'Timestamp when client submitted review';
COMMENT ON TABLE "instructor_reviews" IS 'Reviews submitted by clients for instructors, linked to bookings';
