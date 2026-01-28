-- Add missing columns to school_admins table
ALTER TABLE "school_admins" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "school_admins" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "school_admins" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;