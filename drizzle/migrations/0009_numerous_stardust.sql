ALTER TABLE "schools" RENAME COLUMN "email" TO "school_email";--> statement-breakpoint
ALTER TABLE "schools" RENAME COLUMN "phone" TO "school_phone";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "country_prefix" TO "country_code";--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "country_code" varchar(4) NOT NULL;--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'instructor-independent', 'instructor-school', 'school-admin', 'client');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";