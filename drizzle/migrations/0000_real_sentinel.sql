CREATE TYPE "public"."modality_slug" AS ENUM('piste', 'off-piste', 'freeride', 'freestyle', 'touring', 'adaptive');--> statement-breakpoint
CREATE TYPE "public"."sport_slug" AS ENUM('ski', 'snowboard', 'telemark');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'instructor', 'school-admin', 'client');--> statement-breakpoint
CREATE TABLE "countries" (
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "countries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "countries_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "countries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "instructor_resorts" (
	"instructor_id" integer NOT NULL,
	"resort_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructor_sports" (
	"instructor_id" integer NOT NULL,
	"sport_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lessons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(100),
	"description" text,
	"price" integer,
	"duration" varchar(50),
	"sport_id" integer NOT NULL,
	"instructor_id" integer,
	"school_id" integer,
	"is_published" boolean DEFAULT true,
	CONSTRAINT "lessons_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "regions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"country_id" integer NOT NULL,
	CONSTRAINT "regions_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resorts" (
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resorts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"region_id" integer NOT NULL,
	CONSTRAINT "resorts_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "resorts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "school_admins" (
	"school_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"is_accepted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "school_instructor_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "school_instructor_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"instructor_id" integer NOT NULL,
	"school_id" integer,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"role" varchar(100),
	"notes" text,
	"is_independent" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "school_instructors" (
	"school_id" integer NOT NULL,
	"instructor_id" integer NOT NULL,
	"is_accepted_by_school" boolean DEFAULT false,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "school_resorts" (
	"school_id" integer NOT NULL,
	"resort_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_sports" (
	"school_id" integer NOT NULL,
	"sport_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "schools_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"owner_user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"bio" text,
	"email" varchar(255),
	"phone" varchar(50),
	"logo" varchar(255),
	"is_published" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	CONSTRAINT "schools_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "schools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports" (
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"slug" "sport_slug" NOT NULL,
	CONSTRAINT "sports_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "sports_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"google_id" varchar,
	"name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"username" varchar(50),
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role",
	"bio" text,
	"profile_image" varchar(255) DEFAULT '/local-snow-head.png',
	"phone" varchar(50),
	"is_verified" boolean DEFAULT false,
	"accepted_terms" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "instructor_resorts" ADD CONSTRAINT "instructor_resorts_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_resorts" ADD CONSTRAINT "instructor_resorts_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_sports" ADD CONSTRAINT "instructor_sports_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_sports" ADD CONSTRAINT "instructor_sports_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resorts" ADD CONSTRAINT "resorts_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_admins" ADD CONSTRAINT "school_admins_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_admins" ADD CONSTRAINT "school_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_instructor_history" ADD CONSTRAINT "school_instructor_history_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_instructor_history" ADD CONSTRAINT "school_instructor_history_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD CONSTRAINT "school_instructors_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_instructors" ADD CONSTRAINT "school_instructors_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_resorts" ADD CONSTRAINT "school_resorts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_resorts" ADD CONSTRAINT "school_resorts_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_sports" ADD CONSTRAINT "school_sports_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_sports" ADD CONSTRAINT "school_sports_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;