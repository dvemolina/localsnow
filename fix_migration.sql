-- Fix migration tracking for launch_codes system
-- Run this SQL script in your database

-- Step 1: Check if the migration is already recorded
SELECT * FROM __drizzle_migrations WHERE hash = '0033_add_launch_codes_system';

-- Step 2: If the table exists but migration is not recorded, manually add it
-- (Only run this if Step 1 returns no rows)
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES (
    '0033_add_launch_codes_system',
    EXTRACT(EPOCH FROM NOW()) * 1000
)
ON CONFLICT (hash) DO NOTHING;

-- Step 3: Verify the launch_codes table structure
\d launch_codes;

-- Step 4: Verify the new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('booking_requests', 'lead_payments')
AND column_name = 'used_launch_code';

-- Step 5: Check if BETA2025 code exists
SELECT * FROM launch_codes WHERE code = 'BETA2025';

-- If BETA2025 doesn't exist, insert it:
INSERT INTO launch_codes (code, description, valid_until, is_active, max_uses, current_uses)
VALUES (
    'BETA2025',
    'Beta launch access code - Free booking requests and lead unlocks for early adopters',
    '2025-03-31 23:59:59',
    true,
    500,
    0
)
ON CONFLICT (code) DO NOTHING;
