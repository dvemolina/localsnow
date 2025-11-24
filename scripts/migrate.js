#!/usr/bin/env node
/**
 * Production-ready database migration runner
 * Runs all SQL migrations from drizzle/migrations directory
 * No drizzle-kit dependency needed - uses raw SQL files
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Get DATABASE_URL from environment or secret file
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

// Determine SSL mode
const shouldUseSSL = DATABASE_URL.includes('sslmode=require') ||
                     DATABASE_URL.includes('amazonaws.com') ||
                     DATABASE_URL.includes('supabase.co') ||
                     DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: shouldUseSSL ? { rejectUnauthorized: true } : false,
  max: 1 // Only need one connection for migrations
});

async function createMigrationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );
    `);
    console.log('✅ Migrations table ready');
  } finally {
    client.release();
  }
}

async function getAppliedMigrations() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT hash FROM __drizzle_migrations ORDER BY created_at'
    );
    return new Set(result.rows.map(row => row.hash));
  } finally {
    client.release();
  }
}

async function recordMigration(hash) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)',
      [hash, Date.now()]
    );
  } finally {
    client.release();
  }
}

async function runMigrations() {
  console.log('🗄️  Starting database migrations...\n');

  try {
    // Create migrations tracking table
    await createMigrationsTable();

    // Get already applied migrations
    const appliedMigrations = await getAppliedMigrations();

    // Find migration directory
    const migrationsDir = path.join(__dirname, '../drizzle/migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found at:', migrationsDir);
      return;
    }

    // Read all .sql files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Migrations should run in order

    if (files.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }

    console.log(`📁 Found ${files.length} migration files\n`);

    let applied = 0;
    let skipped = 0;

    for (const file of files) {
      const migrationPath = path.join(migrationsDir, file);
      const hash = file; // Use filename as hash

      if (appliedMigrations.has(hash)) {
        console.log(`⏭️  Skipping ${file} (already applied)`);
        skipped++;
        continue;
      }

      console.log(`▶️  Applying ${file}...`);

      const sql = fs.readFileSync(migrationPath, 'utf-8');
      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        await recordMigration(hash);
        console.log(`✅ Applied ${file}`);
        applied++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed to apply ${file}:`, error.message);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log(`\n🎉 Migrations complete!`);
    console.log(`   Applied: ${applied}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${files.length}\n`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
