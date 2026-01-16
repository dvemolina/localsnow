CREATE TABLE "instructor_leads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "instructor_leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"instructor_id" integer NOT NULL,
	"client_name" varchar(100),
	"client_email" varchar(255) NOT NULL,
	"client_phone" varchar(20),
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "instructor_leads_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "instructor_leads" ADD CONSTRAINT "instructor_leads_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "idx_instructor_leads_instructor" ON "instructor_leads" ("instructor_id");
CREATE INDEX "idx_instructor_leads_created" ON "instructor_leads" ("created_at" DESC);
CREATE INDEX "idx_instructor_leads_status" ON "instructor_leads" ("status");