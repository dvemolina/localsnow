import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const PGPOOLSIZE = 10

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: PGPOOLSIZE ? Number(process.env.PGPOOLSIZE) : 10
});

export const db = drizzle(pool, { schema });
