/**
 * Script to fix launch_codes migration
 * Run with: node scripts/fix-migration.js
 */

import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

async function fixMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('✓ Connected to database\n');

        // Step 1: Check if migration is already recorded
        console.log('1. Checking migration status...');
        const migrationCheck = await client.query(
            "SELECT * FROM __drizzle_migrations WHERE hash = '0033_add_launch_codes_system'"
        );

        if (migrationCheck.rows.length > 0) {
            console.log('✓ Migration already recorded in __drizzle_migrations');
        } else {
            console.log('⚠ Migration not recorded, adding it...');
            await client.query(
                "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)",
                ['0033_add_launch_codes_system', Date.now()]
            );
            console.log('✓ Migration recorded');
        }

        // Step 2: Ensure launch_codes table exists
        console.log('\n2. Checking launch_codes table...');
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'launch_codes'
            ) as exists
        `);

        if (tableCheck.rows[0].exists) {
            console.log('✓ launch_codes table exists');
        } else {
            console.log('⚠ Creating launch_codes table...');
            await client.query(`
                CREATE TABLE "launch_codes" (
                    "id" serial PRIMARY KEY NOT NULL,
                    "code" varchar(50) NOT NULL,
                    "description" text,
                    "valid_until" timestamp NOT NULL,
                    "is_active" boolean DEFAULT true NOT NULL,
                    "max_uses" integer,
                    "current_uses" integer DEFAULT 0 NOT NULL,
                    "created_at" timestamp DEFAULT now() NOT NULL,
                    CONSTRAINT "launch_codes_code_unique" UNIQUE("code")
                )
            `);
            console.log('✓ Table created');
        }

        // Step 3: Ensure columns exist in booking_requests and lead_payments
        console.log('\n3. Checking used_launch_code columns...');

        // Check booking_requests
        const bookingColumnCheck = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'booking_requests'
            AND column_name = 'used_launch_code'
        `);

        if (bookingColumnCheck.rows.length === 0) {
            console.log('⚠ Adding used_launch_code to booking_requests...');
            await client.query('ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS used_launch_code varchar(50)');
            console.log('✓ Column added');
        } else {
            console.log('✓ booking_requests.used_launch_code exists');
        }

        // Check lead_payments
        const leadColumnCheck = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'lead_payments'
            AND column_name = 'used_launch_code'
        `);

        if (leadColumnCheck.rows.length === 0) {
            console.log('⚠ Adding used_launch_code to lead_payments...');
            await client.query('ALTER TABLE lead_payments ADD COLUMN IF NOT EXISTS used_launch_code varchar(50)');
            console.log('✓ Column added');
        } else {
            console.log('✓ lead_payments.used_launch_code exists');
        }

        // Step 4: Insert BETA2025 code
        console.log('\n4. Checking BETA2025 code...');
        const codeCheck = await client.query("SELECT * FROM launch_codes WHERE code = 'BETA2025'");

        if (codeCheck.rows.length === 0) {
            console.log('⚠ Inserting BETA2025 code...');
            await client.query(`
                INSERT INTO launch_codes (code, description, valid_until, is_active, max_uses, current_uses)
                VALUES (
                    'BETA2025',
                    'Beta launch access code - Free booking requests and lead unlocks for early adopters',
                    '2025-03-31 23:59:59',
                    true,
                    500,
                    0
                )
            `);
            console.log('✓ BETA2025 code inserted');
        } else {
            console.log('✓ BETA2025 code exists');
            console.log('\nCode details:');
            console.table(codeCheck.rows[0]);
        }

        // Step 5: Final verification
        console.log('\n5. Final verification...');
        const verification = await client.query(`
            SELECT
                'launch_codes table' as check_item,
                EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'launch_codes') as exists
            UNION ALL
            SELECT
                'BETA2025 code',
                EXISTS(SELECT FROM launch_codes WHERE code = 'BETA2025')
            UNION ALL
            SELECT
                'booking_requests.used_launch_code',
                EXISTS(SELECT FROM information_schema.columns WHERE table_name = 'booking_requests' AND column_name = 'used_launch_code')
            UNION ALL
            SELECT
                'lead_payments.used_launch_code',
                EXISTS(SELECT FROM information_schema.columns WHERE table_name = 'lead_payments' AND column_name = 'used_launch_code')
        `);

        console.log('\nVerification results:');
        console.table(verification.rows);

        const allPassed = verification.rows.every(row => row.exists);

        if (allPassed) {
            console.log('\n✅ All checks passed! Migration is complete.');
        } else {
            console.log('\n❌ Some checks failed. Please review the errors above.');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✓ Database connection closed');
    }
}

fixMigration();
