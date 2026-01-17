-- Custom SQL migration file, put your code below! --
ALTER TABLE "users"
	ADD COLUMN IF NOT EXISTS "is_suspended" boolean DEFAULT false,
	ADD COLUMN IF NOT EXISTS "suspension_reason" text,
	ADD COLUMN IF NOT EXISTS "suspended_at" timestamp;