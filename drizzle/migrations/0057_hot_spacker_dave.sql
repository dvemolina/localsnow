CREATE TABLE "funnel_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "funnel_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(120) NOT NULL,
	"funnel" varchar(40) NOT NULL,
	"stage" varchar(60) NOT NULL,
	"user_id" integer,
	"entity_type" varchar(60),
	"entity_id" integer,
	"source_path" varchar(500),
	"locale" varchar(5),
	"country_code" varchar(8),
	"is_spain" boolean DEFAULT false NOT NULL,
	"consent_status" varchar(20) DEFAULT 'unknown' NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "funnel_events_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "funnel_events" ADD CONSTRAINT "funnel_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;