-- Migration: Add Instructor Lessons & Manual Review Collection System
-- This migration adds support for instructors to log lessons taught outside the marketplace
-- and collect reviews for those lessons through shareable links.

-- Create instructor_lessons table
CREATE TABLE IF NOT EXISTS "instructor_lessons" (
    "id" SERIAL PRIMARY KEY,
    "uuid" UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    "instructor_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "client_name" VARCHAR(100) NOT NULL,
    "client_email" VARCHAR(255) NOT NULL,
    "client_country_code" VARCHAR(4),
    "client_phone" VARCHAR(50),
    "lesson_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "duration" NUMERIC(4,1) NOT NULL CHECK ("duration" > 0 AND "duration" <= 12),
    "number_of_students" INTEGER NOT NULL DEFAULT 1 CHECK ("number_of_students" >= 1 AND "number_of_students" <= 20),
    "sport" VARCHAR(50),
    "skill_level" VARCHAR(50),
    "resort_id" INTEGER REFERENCES "resorts"("id") ON DELETE SET NULL,
    "resort_name" VARCHAR(100),
    "instructor_notes" TEXT,
    "source" VARCHAR(50) NOT NULL DEFAULT 'manual' CHECK ("source" IN ('manual', 'marketplace')),
    "booking_request_id" INTEGER UNIQUE REFERENCES "booking_requests"("id") ON DELETE SET NULL,
    "review_request_sent" BOOLEAN NOT NULL DEFAULT FALSE,
    "review_request_sent_at" TIMESTAMP WITH TIME ZONE,
    "review_token" VARCHAR(64) UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Add instructor_lesson_id to reviews table
ALTER TABLE "reviews"
ADD COLUMN IF NOT EXISTS "instructor_lesson_id" INTEGER
REFERENCES "instructor_lessons"("id") ON DELETE SET NULL;

-- Make bookingRequestId nullable (since manual reviews won't have one)
ALTER TABLE "reviews"
ALTER COLUMN "booking_request_id" DROP NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_instructor_lessons_instructor_id"
    ON "instructor_lessons"("instructor_id");

CREATE INDEX IF NOT EXISTS "idx_instructor_lessons_client_email"
    ON "instructor_lessons"("client_email");

CREATE INDEX IF NOT EXISTS "idx_instructor_lessons_booking_request_id"
    ON "instructor_lessons"("booking_request_id");

CREATE INDEX IF NOT EXISTS "idx_instructor_lessons_review_token"
    ON "instructor_lessons"("review_token");

CREATE INDEX IF NOT EXISTS "idx_instructor_lessons_resort_id"
    ON "instructor_lessons"("resort_id");

CREATE INDEX IF NOT EXISTS "idx_reviews_instructor_lesson_id"
    ON "reviews"("instructor_lesson_id");

-- Add comments for documentation
COMMENT ON TABLE "instructor_lessons" IS 'Lessons taught by instructors (both marketplace and manual) for tracking and review collection';
COMMENT ON COLUMN "instructor_lessons"."source" IS 'Origin of the lesson: manual (logged by instructor) or marketplace (from booking system)';
COMMENT ON COLUMN "instructor_lessons"."review_token" IS 'Secure token for generating shareable review links';
COMMENT ON COLUMN "instructor_lessons"."booking_request_id" IS 'Link to marketplace booking if source is marketplace';
COMMENT ON COLUMN "reviews"."instructor_lesson_id" IS 'Link to instructor lesson for manual reviews (mutually exclusive with booking_request_id)';
