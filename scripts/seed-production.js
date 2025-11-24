#!/usr/bin/env node
/**
 * Production database seeding script
 * Idempotent and aligned with your PostgreSQL schema
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Resolve DATABASE_URL
function getDatabaseUrl() {
  if (process.env.DATABASE_URL_FILE && fs.existsSync(process.env.DATABASE_URL_FILE)) {
    return fs.readFileSync(process.env.DATABASE_URL_FILE, "utf-8").trim();
  }
  return process.env.DATABASE_URL;
}

const DATABASE_URL = getDatabaseUrl();

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL or DATABASE_URL_FILE must be set");
  process.exit(1);
}

// SSL handling (Neon / Supabase / AWS)
const shouldUseSSL =
  DATABASE_URL.includes("sslmode=require") ||
  DATABASE_URL.includes("amazonaws.com") ||
  DATABASE_URL.includes("supabase.co") ||
  DATABASE_URL.includes("neon.tech");

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: shouldUseSSL ? { rejectUnauthorized: false } : false
});

// Load seed data safely
async function loadSeedData() {
  try {
    const countriesModule = await import('../src/lib/server/db/seeds/data/countries.js');
    const regionsModule = await import('../src/lib/server/db/seeds/data/regions.js');
    const resortsModule = await import('../src/lib/server/db/seeds/data/resorts.js');
    const sportsModule = await import('../src/lib/server/db/seeds/data/sports.js');

    return {
      countries: countriesModule.countries || countriesModule.default,
      regions: regionsModule.regions || regionsModule.default,
      resorts: resortsModule.resorts || resortsModule.default,
      sports: sportsModule.sports || sportsModule.default
    };
  } catch (err) {
    console.error('❌ Failed to load seed files:', err);
    process.exit(1);
  }
}

//
// TABLE SEEDERS
//

async function seedSports(sportsData) {
  console.log("📍 Seeding sports…");
  const client = await pool.connect();
  let created = 0;

  try {
    for (const s of sportsData) {
      const exists = await client.query(
        `SELECT id FROM sports WHERE sport_slug = $1`,
        [s.sportSlug]
      );

      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO sports (sport, sport_slug) VALUES ($1, $2)`,
          [s.sport, s.sportSlug]
        );
        created++;
      }
    }

    console.log(`✅ Sports: ${created} new, ${sportsData.length - created} existing\n`);
  } finally {
    client.release();
  }
}

async function seedCountries(countriesData) {
  console.log("📍 Seeding countries…");
  const client = await pool.connect();
  let created = 0;
  const idMap = new Map();

  try {
    for (let i = 0; i < countriesData.length; i++) {
      const c = countriesData[i];
      const csvId = i + 1;

      const exists = await client.query(
        `SELECT id FROM countries WHERE country_slug = $1`,
        [c.countrySlug]
      );

      if (exists.rows.length === 0) {
        const insert = await client.query(
          `INSERT INTO countries (country, country_code, country_slug)
           VALUES ($1, $2, $3) RETURNING id`,
          [c.country, c.countryCode, c.countrySlug]
        );
        idMap.set(csvId, insert.rows[0].id);
        created++;
      } else {
        idMap.set(csvId, exists.rows[0].id);
      }
    }

    console.log(`✅ Countries: ${created} new, ${countriesData.length - created} existing\n`);
    return idMap;
  } finally {
    client.release();
  }
}

async function seedRegions(regionsData, countryIdMap) {
  console.log("📍 Seeding regions…");
  const client = await pool.connect();
  let created = 0;
  const idMap = new Map();

  try {
    for (let i = 0; i < regionsData.length; i++) {
      const r = regionsData[i];
      const csvId = i + 1;

      const newCountryId = countryIdMap.get(r.countryId);

      const exists = await client.query(
        `SELECT id FROM regions WHERE region_slug = $1`,
        [r.regionSlug]
      );

      if (exists.rows.length === 0) {
        const insert = await client.query(
          `INSERT INTO regions (country_id, region, region_slug)
           VALUES ($1, $2, $3) RETURNING id`,
          [newCountryId, r.region, r.regionSlug]
        );
        idMap.set(csvId, insert.rows[0].id);
        created++;
      } else {
        idMap.set(csvId, exists.rows[0].id);
      }
    }

    console.log(`✅ Regions: ${created} new, ${regionsData.length - created} existing\n`);
    return idMap;
  } finally {
    client.release();
  }
}

async function seedResorts(resortsData, countryIdMap, regionIdMap) {
  console.log("📍 Seeding resorts…");
  const client = await pool.connect();
  let created = 0;

  try {
    for (const r of resortsData) {
      const countryId = countryIdMap.get(r.countryId);
      const regionId = r.regionId ? regionIdMap.get(r.regionId) : null;

      const exists = await client.query(
        `SELECT id FROM resorts WHERE slug = $1`,
        [r.slug]
      );

      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO resorts (
            country_id,
            region_id,
            name,
            slug,
            label,
            min_elevation,
            max_elevation,
            lat,
            lon,
            website,
            image
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            countryId,
            regionId,
            r.name,
            r.slug,
            r.label ?? null,
            r.minElevation ?? null,
            r.maxElevation ?? null,
            r.lat ?? null,
            r.lon ?? null,
            r.website ?? null,
            r.image ?? null
          ]
        );
        created++;
      }
    }

    console.log(`✅ Resorts: ${created} new, ${resortsData.length - created} existing\n`);
  } finally {
    client.release();
  }
}

//
// RUN ALL
//

async function runSeeds() {
  console.log("🌱 Starting database seeding…\n");

  try {
    const data = await loadSeedData();

    const countryIdMap = await seedCountries(data.countries);
    const regionIdMap = await seedRegions(data.regions, countryIdMap);
    await seedResorts(data.resorts, countryIdMap, regionIdMap);
    await seedSports(data.sports);

    console.log("🎉 Database seeding completed!\n");
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeeds();
