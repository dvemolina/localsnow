CREATE TABLE "client_deposits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "client_deposits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"booking_request_id" integer NOT NULL,
	"client_email" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"refunded_at" timestamp,
	"forfeited_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "client_deposits_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "client_deposits" ADD CONSTRAINT "client_deposits_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE cascade ON UPDATE no action;