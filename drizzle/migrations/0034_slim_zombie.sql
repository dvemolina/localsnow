CREATE TABLE "launch_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"valid_until" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "launch_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "used_launch_code" varchar(50);--> statement-breakpoint
ALTER TABLE "lead_payments" ADD COLUMN "used_launch_code" varchar(50);