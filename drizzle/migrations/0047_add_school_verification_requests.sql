-- Add school verification requests table (admin-only verification)
CREATE TABLE IF NOT EXISTS "school_verification_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "school_verification_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"school_id" integer,
	"requester_id" integer NOT NULL,
	"school_name" varchar(100) NOT NULL,
	"school_email" varchar(255),
	"school_phone" varchar(50),
	"resort_id" integer,
	"country_code" varchar(4),
	"message" text,
	"proof_document" varchar(255),
	"status" "school_claim_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"admin_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "school_verification_requests_uuid_unique" UNIQUE("uuid")
);

-- Add foreign keys
ALTER TABLE "school_verification_requests" ADD CONSTRAINT "school_verification_requests_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "school_verification_requests" ADD CONSTRAINT "school_verification_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "school_verification_requests" ADD CONSTRAINT "school_verification_requests_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "school_verification_requests" ADD CONSTRAINT "school_verification_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
