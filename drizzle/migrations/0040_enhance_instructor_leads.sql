-- Add lesson-related fields to instructor_leads table
ALTER TABLE "instructor_leads" ADD COLUMN "preferred_dates" text;
ALTER TABLE "instructor_leads" ADD COLUMN "number_of_students" integer;
ALTER TABLE "instructor_leads" ADD COLUMN "skill_level" varchar(20);
