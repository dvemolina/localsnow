-- Add client_user_id column to booking_requests for authenticated users
-- This provides a more robust way to associate bookings with user accounts
-- Nullable for backward compatibility with existing email-based bookings

-- Add the column
ALTER TABLE "booking_requests"
ADD COLUMN "client_user_id" integer;

-- Add foreign key constraint
ALTER TABLE "booking_requests"
ADD CONSTRAINT "booking_requests_client_user_id_users_id_fk"
FOREIGN KEY ("client_user_id")
REFERENCES "users"("id")
ON DELETE SET NULL;

-- Create index for faster lookups by client user ID
CREATE INDEX IF NOT EXISTS "booking_requests_client_user_id_idx"
ON "booking_requests" ("client_user_id");

-- Create composite index for common query patterns (user_id + status)
CREATE INDEX IF NOT EXISTS "booking_requests_client_user_id_status_idx"
ON "booking_requests" ("client_user_id", "status");

-- Optionally migrate existing data:
-- This attempts to match existing bookings to user accounts by email
-- Run this only if you want to associate existing bookings with user accounts
-- Comment out if you prefer to keep existing bookings email-only

UPDATE "booking_requests" br
SET "client_user_id" = u.id
FROM "users" u
WHERE br."client_email" = u.email
AND br."client_user_id" IS NULL;

-- Add comment to the column
COMMENT ON COLUMN "booking_requests"."client_user_id" IS
'Foreign key to users table for authenticated clients. Nullable for guest bookings and backward compatibility.';
