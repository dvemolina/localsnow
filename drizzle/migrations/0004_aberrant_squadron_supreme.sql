ALTER TABLE "countries" RENAME COLUMN "name" TO "country";--> statement-breakpoint
ALTER TABLE "countries" RENAME COLUMN "slug" TO "country_slug";--> statement-breakpoint
ALTER TABLE "regions" RENAME COLUMN "name" TO "region";--> statement-breakpoint
ALTER TABLE "regions" RENAME COLUMN "slug" TO "region_slug";--> statement-breakpoint
ALTER TABLE "countries" DROP CONSTRAINT "countries_slug_unique";--> statement-breakpoint
ALTER TABLE "regions" DROP CONSTRAINT "regions_slug_unique";--> statement-breakpoint
ALTER TABLE "resorts" DROP CONSTRAINT "resorts_region_id_regions_id_fk";
--> statement-breakpoint
ALTER TABLE "countries" ADD COLUMN "country_code" varchar(4) NOT NULL;--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "label" varchar(150);--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "min_elevation" integer;--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "max_elevation" integer;--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "lat" numeric(10, 6) NOT NULL;--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "lon" numeric(10, 6) NOT NULL;--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "country_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "resorts" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "resorts" ADD CONSTRAINT "resorts_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resorts" ADD CONSTRAINT "resorts_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_country_slug_unique" UNIQUE("country_slug");--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_region_slug_unique" UNIQUE("region_slug");