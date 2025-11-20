-- Create launch_codes table
CREATE TABLE IF NOT EXISTS "launch_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL UNIQUE,
	"description" text,
	"valid_until" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Seed BETA2025 code (valid until March 31, 2025)
INSERT INTO "launch_codes" ("code", "description", "valid_until", "is_active", "max_uses", "current_uses")
VALUES (
	'BETA2025',
	'Beta launch access code - Free booking requests and lead unlocks for early adopters',
	'2025-03-31 23:59:59',
	true,
	500,
	0
);

-- Add used_launch_code field to booking_requests
ALTER TABLE "booking_requests" ADD COLUMN "used_launch_code" varchar(50);

-- Add used_launch_code field to lead_payments
ALTER TABLE "lead_payments" ADD COLUMN "used_launch_code" varchar(50);

-- Create index for faster launch code lookups
CREATE INDEX IF NOT EXISTS "launch_codes_code_idx" ON "launch_codes" ("code");
CREATE INDEX IF NOT EXISTS "booking_requests_launch_code_idx" ON "booking_requests" ("used_launch_code");
CREATE INDEX IF NOT EXISTS "lead_payments_launch_code_idx" ON "lead_payments" ("used_launch_code");
