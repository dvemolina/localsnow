-- Custom SQL migration file, put your code below! 
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "school_id" integer;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'booking_requests_school_id_schools_id_fk'
  ) THEN
    ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_school_id_schools_id_fk" 
      FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL;
  END IF;
END $$;
