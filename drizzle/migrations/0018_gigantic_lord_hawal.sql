CREATE TYPE "public"."pricing_mode" AS ENUM('per_hour', 'per_session', 'per_day');--> statement-breakpoint
CREATE TABLE "conditional_pricing" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conditional_pricing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" integer NOT NULL,
	"condition_type" varchar(50) NOT NULL,
	"min_value" integer,
	"max_value" integer,
	"adjustment_type" varchar(50) NOT NULL,
	"adjustment_value" numeric(10, 2) NOT NULL,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "conditional_pricing_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "pricing_modes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pricing_modes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mode" "pricing_mode" NOT NULL,
	"label" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "pricing_modes_mode_unique" UNIQUE("mode")
);
--> statement-breakpoint
CREATE TABLE "promotional_pricing" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "promotional_pricing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" integer,
	"instructor_id" integer,
	"code" varchar(50),
	"discount_type" varchar(50) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0,
	"min_purchase_amount" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "promotional_pricing_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "promotional_pricing_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "conditional_pricing" ADD CONSTRAINT "conditional_pricing_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotional_pricing" ADD CONSTRAINT "promotional_pricing_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotional_pricing" ADD CONSTRAINT "promotional_pricing_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Insert default pricing modes
INSERT INTO "pricing_modes" ("mode", "label", "description") VALUES 
	('per_hour', 'Per Hour', 'Price calculated per hour of instruction'),
	('per_session', 'Per Session', 'Fixed price per session regardless of duration'),
	('per_day', 'Per Day', 'Price calculated per day (half-day, full-day)');