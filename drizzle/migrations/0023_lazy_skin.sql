CREATE TABLE "lead_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_request_id" integer NOT NULL,
	"instructor_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"stripe_checkout_session_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "contact_info_unlocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_payments" ADD CONSTRAINT "lead_payments_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_payments" ADD CONSTRAINT "lead_payments_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;