CREATE TABLE "role_transition_archive" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "role_transition_archive_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"admin_id" integer,
	"from_role" "user_role",
	"to_role" "user_role" NOT NULL,
	"archived_user_data" text NOT NULL,
	"archived_sports" integer[],
	"archived_resorts" integer[],
	"archived_school_id" integer,
	"transition_reason" text,
	"can_restore" boolean DEFAULT true,
	"restored_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_transition_blocks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "role_transition_blocks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"block_type" varchar(50) NOT NULL,
	"block_data" text,
	"resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_role_change" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_change_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "role_transition_archive" ADD CONSTRAINT "role_transition_archive_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_transition_archive" ADD CONSTRAINT "role_transition_archive_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_transition_blocks" ADD CONSTRAINT "role_transition_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;