-- Add reviewer_id to track which user left the review (optional - for logged-in users)
ALTER TABLE "instructor_reviews"
ADD COLUMN "reviewer_id" integer REFERENCES "users"("id") ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX "instructor_reviews_reviewer_id_idx" ON "instructor_reviews"("reviewer_id");

-- Add comment explaining the column
COMMENT ON COLUMN "instructor_reviews"."reviewer_id" IS 'Optional: User ID if reviewer was logged in. Null for anonymous token-based reviews';
