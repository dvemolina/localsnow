ALTER TABLE "client_deposits" ALTER COLUMN "client_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN "booking_identifier" varchar(100);--> statement-breakpoint
ALTER TABLE "instructor_reviews" ADD COLUMN "reviewer_name" varchar(100);