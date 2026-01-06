-- Add missing columns to school_instructors table
ALTER TABLE "school_instructors" ADD COLUMN "requested_by" varchar(20);
ALTER TABLE "school_instructors" ADD COLUMN "requested_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "school_instructors" ADD COLUMN "accepted_at" timestamp;
ALTER TABLE "school_instructors" ADD COLUMN "rejected_at" timestamp;
ALTER TABLE "school_instructors" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
