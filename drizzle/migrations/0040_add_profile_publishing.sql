-- Add is_published column to users table for profile publishing controls
ALTER TABLE "users" ADD COLUMN "is_published" boolean DEFAULT false;

-- Backfill existing instructors as published (so they remain visible)
UPDATE "users"
SET "is_published" = true
WHERE "role" IN ('instructor-independent', 'instructor-school');

-- Add index for directory queries (improves performance)
CREATE INDEX IF NOT EXISTS "idx_users_published_role" ON "users" ("is_published", "role")
WHERE "role" IN ('instructor-independent', 'instructor-school');
