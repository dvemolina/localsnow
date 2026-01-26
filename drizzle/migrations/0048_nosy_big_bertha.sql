CREATE TYPE "public"."resort_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "resort_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resort_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" integer NOT NULL,
	"requester_email" varchar(255) NOT NULL,
	"requester_name" varchar(100) NOT NULL,
	"resort_name" varchar(100) NOT NULL,
	"country_id" integer,
	"region_id" integer,
	"website" varchar(255),
	"additional_info" text,
	"status" "resort_request_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_admin_id" integer,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_resort_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "resort_requests_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "resort_requests" ADD CONSTRAINT "resort_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_requests" ADD CONSTRAINT "resort_requests_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_requests" ADD CONSTRAINT "resort_requests_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_requests" ADD CONSTRAINT "resort_requests_reviewed_by_admin_id_users_id_fk" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_requests" ADD CONSTRAINT "resort_requests_created_resort_id_resorts_id_fk" FOREIGN KEY ("created_resort_id") REFERENCES "public"."resorts"("id") ON DELETE set null ON UPDATE no action;