CREATE TABLE "reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"booking_request_id" integer NOT NULL,
	"instructor_id" integer NOT NULL,
	"client_email" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "reviews_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "reviews_booking_request_id_unique" UNIQUE("booking_request_id")
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;