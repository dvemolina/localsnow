-- Drop the auto-generated migration first if it was partially applied
DROP TYPE IF EXISTS "public"."status" CASCADE;

-- Create the enum type
CREATE TYPE "public"."status" AS ENUM('pending', 'viewed', 'accepted', 'rejected');

-- Create the user_booking_limits table
CREATE TABLE IF NOT EXISTS "user_booking_limits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_booking_limits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"client_email" varchar(255) NOT NULL,
	"active_requests_count" integer DEFAULT 0,
	"last_request_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "user_booking_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);

-- Update existing status values to ensure they match enum values
UPDATE "booking_requests" 
SET "status" = 'pending' 
WHERE "status" IS NULL OR "status" = '';

-- Step 1: Drop the default constraint first
ALTER TABLE "booking_requests" 
ALTER COLUMN "status" DROP DEFAULT;

-- Step 2: Convert the status column using USING clause
ALTER TABLE "booking_requests" 
ALTER COLUMN "status" TYPE status 
USING "status"::status;

-- Step 3: Add back the default with proper enum type casting
ALTER TABLE "booking_requests" 
ALTER COLUMN "status" SET DEFAULT 'pending'::status;

-- Fix the instructor_working_hours timestamps with USING clause
ALTER TABLE "instructor_working_hours" 
ALTER COLUMN "season_start" TYPE timestamp 
USING "season_start"::timestamp;

ALTER TABLE "instructor_working_hours" 
ALTER COLUMN "season_end" TYPE timestamp 
USING "season_end"::timestamp;