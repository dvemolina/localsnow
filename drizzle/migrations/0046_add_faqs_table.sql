-- Create FAQs table for dynamic FAQ management
CREATE TABLE IF NOT EXISTS "faqs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "faqs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"display_order" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_faqs_entity_type" ON "faqs" ("entity_type");
CREATE INDEX IF NOT EXISTS "idx_faqs_entity_id" ON "faqs" ("entity_id");
CREATE INDEX IF NOT EXISTS "idx_faqs_is_published" ON "faqs" ("is_published");
CREATE INDEX IF NOT EXISTS "idx_faqs_display_order" ON "faqs" ("display_order");

-- Add foreign key constraints (with ON DELETE CASCADE for clean-up)
-- Note: We can't add a single FK for entity_id since it can reference different tables
-- Instead, we'll handle referential integrity at the application level
