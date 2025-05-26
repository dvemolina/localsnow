ALTER TABLE "lessons" RENAME COLUMN "price" TO "base_price";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "profile_image" TO "profile_image_url";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "qualification_file" TO "qualification_url";--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "currency" varchar(50);--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "is_base_lesson" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country_prefix" integer;