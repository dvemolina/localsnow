ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "is_suspended" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "suspension_reason" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "suspended_at" timestamp with time zone;