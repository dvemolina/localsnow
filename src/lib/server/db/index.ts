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

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  max: PGPOOLSIZE ? Number(process.env.PGPOOLSIZE) : 10
});

export const db = drizzle(pool, { schema });
