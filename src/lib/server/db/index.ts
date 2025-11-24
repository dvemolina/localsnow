import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import 'dotenv/config';
import pg from 'pg';
import { DATABASE_URL, NODE_ENV } from '../config';

const { Pool } = pg;

const PGPOOLSIZE = 10

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Check if we should use SSL based on DATABASE_URL
// If URL contains sslmode=require or uses a cloud provider, use SSL
// For local development and Docker Swarm deployments without SSL, disable it
const shouldUseSSL = DATABASE_URL.includes('sslmode=require') ||
                     DATABASE_URL.includes('amazonaws.com') ||
                     DATABASE_URL.includes('supabase.co') ||
                     DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: shouldUseSSL ? { rejectUnauthorized: true } : false,
  max: PGPOOLSIZE ? Number(process.env.PGPOOLSIZE) : 10
});

export const db = drizzle(pool, { schema });
