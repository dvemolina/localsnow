-- Create instructor_leads table for contact form submissions
CREATE TABLE "instructor_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
	"instructor_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"client_name" varchar(100),
	"client_email" varchar(255) NOT NULL,
	"client_phone" varchar(20),
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX "idx_instructor_leads_instructor" ON "instructor_leads" ("instructor_id");
CREATE INDEX "idx_instructor_leads_created" ON "instructor_leads" ("created_at" DESC);
CREATE INDEX "idx_instructor_leads_status" ON "instructor_leads" ("status");
