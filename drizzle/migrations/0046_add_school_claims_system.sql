-- Add school claim status enum
CREATE TYPE "public"."school_claim_status" AS ENUM('pending', 'approved', 'rejected');

-- Add createdBy column to schools table
ALTER TABLE "schools" ADD COLUMN "created_by" varchar(50) DEFAULT 'school-admin';
ALTER TABLE "schools" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "schools" ADD COLUMN "updated_at" timestamp;
ALTER TABLE "schools" ADD COLUMN "deleted_at" timestamp;

-- Create school_claims table
CREATE TABLE IF NOT EXISTS "school_claims" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "school_claims_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"school_id" integer NOT NULL,
	"claimant_user_id" integer NOT NULL,
	"current_owner_user_id" integer NOT NULL,
	"status" "school_claim_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"response_message" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "school_claims_uuid_unique" UNIQUE("uuid")
);

-- Add foreign keys
ALTER TABLE "school_claims" ADD CONSTRAINT "school_claims_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "school_claims" ADD CONSTRAINT "school_claims_claimant_user_id_users_id_fk" FOREIGN KEY ("claimant_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "school_claims" ADD CONSTRAINT "school_claims_current_owner_user_id_users_id_fk" FOREIGN KEY ("current_owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
