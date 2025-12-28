ALTER TABLE "booking_requests" ADD COLUMN "school_id" integer;--> statement-breakpoint
ALTER TABLE "school_admins" ADD COLUMN "is_owner" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "school_admins" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "school_admins" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "school_admins" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "requested_by" varchar(20);--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "requested_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;