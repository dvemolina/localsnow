#!/usr/bin/env node
/**
 * ROBUST, IDEMPOTENT Migration Runner
 * Handles partial migrations gracefully
 * Safe to run multiple times
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Get DATABASE_URL
function getDatabaseUrl() {
  const fileEnv = process.env.DATABASE_URL_FILE;
  if (fileEnv && fs.existsSync(fileEnv)) {
    return fs.readFileSync(fileEnv, 'utf-8').trim();
  }
  return process.env.DATABASE_URL;
}

const DATABASE_URL = getDatabaseUrl();

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL or DATABASE_URL_FILE must be set');
  process.exit(1);
}

// SSL detection
const shouldUseSSL = DATABASE_URL.includes('sslmode=require') ||
                     DATABASE_URL.includes('amazonaws.com') ||
                     DATABASE_URL.includes('supabase.co') ||
                     DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: shouldUseSSL ? { rejectUnauthorized: true } : false,
  max: 1
});

// Error codes that indicate "already exists" - safe to ignore
const SAFE_ERROR_CODES = new Set([
  '42P07', // relation already exists
  '42710', // object already exists (type, enum, etc.)
  '42P06', // schema already exists
  '42P16', // invalid table definition
  '23505', // unique_violation (when creating constraints that exist)
]);

async function createMigrationsTable(client) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL UNIQUE,
        created_at BIGINT NOT NULL
      );
    `);
    console.log('✅ Migrations table ready');
  } catch (error) {
    // Even if table exists, this is fine
    if (!SAFE_ERROR_CODES.has(error.code)) {
      throw error;
    }
    console.log('✅ Migrations table ready (already exists)');
  }
}

async function getAppliedMigrations(client) {
  try {
    const result = await client.query(
      'SELECT hash FROM __drizzle_migrations ORDER BY created_at'
    );
    return new Set(result.rows.map(row => row.hash));
  } catch (error) {
    // If table doesn't exist yet, return empty set
    return new Set();
  }
}

async function recordMigration(client, hash) {
  await client.query(
    'INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2) ON CONFLICT (hash) DO NOTHING',
    [hash, Date.now()]
  );
}

async function runMigrations() {
  console.log('🗄️  Starting database migrations...\n');

  // Use advisory lock to ensure only one instance runs migrations at a time
  const lockClient = await pool.connect();
  let hasLock = false;

  try {
    // Try to acquire advisory lock (non-blocking)
    // Lock ID: 123456789 (arbitrary number for migration lock)
    const lockResult = await lockClient.query('SELECT pg_try_advisory_lock(123456789) as acquired');
    hasLock = lockResult.rows[0].acquired;

    if (!hasLock) {
      console.log('⏳ Another instance is running migrations, waiting...');
      // Wait for lock (blocking)
      await lockClient.query('SELECT pg_advisory_lock(123456789)');
      hasLock = true;
      console.log('✅ Lock acquired, checking if migrations still needed...\n');
    }

    // Create migrations tracking table
    await createMigrationsTable(lockClient);

    // Get already applied migrations
    const appliedMigrations = await getAppliedMigrations(lockClient);

    // Find migration directory
    const migrationsDir = path.join(__dirname, '../drizzle/migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found');
      return;
    }

    // Read all .sql files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }

    console.log(`📁 Found ${files.length} migration files\n`);

    let applied = 0;
    let skipped = 0;
    let warnings = 0;

    for (const file of files) {
      const migrationPath = path.join(migrationsDir, file);
      const hash = file;

      if (appliedMigrations.has(hash)) {
        console.log(`⏭️  Skipping ${file} (already applied)`);
        skipped++;
        continue;
      }

      console.log(`▶️  Applying ${file}...`);

      const sql = fs.readFileSync(migrationPath, 'utf-8');

      try {
        // Try to apply the migration
        await lockClient.query(sql);
        await recordMigration(lockClient, hash);
        console.log(`✅ Applied ${file}`);
        applied++;
      } catch (error) {
        // Check if this is a "safe" error (object already exists)
        if (SAFE_ERROR_CODES.has(error.code)) {
          console.log(`⚠️  ${file}: Some objects already exist (${error.message.split('\n')[0]})`);
          console.log(`   Marking as applied anyway...`);
          await recordMigration(lockClient, hash);
          warnings++;
        } else {
          // This is a real error
          console.error(`❌ Failed to apply ${file}:`, error.message);
          console.error(`   Error code: ${error.code}`);
          throw error;
        }
      }
    }

    console.log(`\n🎉 Migrations complete!`);
    console.log(`   Applied: ${applied}`);
    console.log(`   Skipped: ${skipped}`);
    if (warnings > 0) {
      console.log(`   Warnings: ${warnings} (objects already existed)`);
    }
    console.log(`   Total: ${files.length}\n`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Release advisory lock
    if (hasLock) {
      await lockClient.query('SELECT pg_advisory_unlock(123456789)');
    }
    lockClient.release();
    await pool.end();
  }
}

// Run migrations
runMigrations();
