ALTER TABLE "school_instructors" ADD COLUMN "requested_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;