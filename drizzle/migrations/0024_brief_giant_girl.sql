CREATE TABLE "instructor_calendar_blocks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "instructor_calendar_blocks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"instructor_id" integer NOT NULL,
	"start_datetime" timestamp NOT NULL,
	"end_datetime" timestamp NOT NULL,
	"all_day" boolean DEFAULT false,
	"source" varchar(50) NOT NULL,
	"booking_request_id" integer,
	"google_event_id" varchar(255),
	"title" varchar(255),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "instructor_calendar_blocks_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "instructor_google_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "instructor_google_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"instructor_id" integer NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expiry" timestamp NOT NULL,
	"calendar_id" varchar(255) DEFAULT 'primary',
	"last_sync_at" timestamp,
	"sync_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "instructor_google_tokens_instructor_id_unique" UNIQUE("instructor_id")
);
--> statement-breakpoint
CREATE TABLE "instructor_working_hours" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "instructor_working_hours_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"instructor_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"season_start" varchar(10),
	"season_end" varchar(10),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "instructor_working_hours_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "instructor_calendar_blocks" ADD CONSTRAINT "instructor_calendar_blocks_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_calendar_blocks" ADD CONSTRAINT "instructor_calendar_blocks_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_google_tokens" ADD CONSTRAINT "instructor_google_tokens_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_working_hours" ADD CONSTRAINT "instructor_working_hours_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;