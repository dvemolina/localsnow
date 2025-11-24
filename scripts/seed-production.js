#!/usr/bin/env node
/**
 * Production database seeding script
 * Seeds countries, regions, resorts, and sports
 * Safe to run multiple times (idempotent)
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
  ssl: shouldUseSSL ? { rejectUnauthorized: true } : false
});

// Import seed data - these need to be JSON for production
// We'll convert TypeScript exports to JSON files
async function loadSeedData() {
  const dataDir = path.join(__dirname, '../src/lib/server/db/seeds/data');

  // Try to load as ES modules (works if data files export default)
  try {
    const countries = await import('../src/lib/server/db/seeds/data/countries.js');
    const regions = await import('../src/lib/server/db/seeds/data/regions.js');
    const resorts = await import('../src/lib/server/db/seeds/data/resorts.js');
    const sports = await import('../src/lib/server/db/seeds/data/sports.js');

    return {
      countries: countries.countries || countries.default,
      regions: regions.regions || regions.default,
      resorts: resorts.resorts || resorts.default,
      sports: sports.sports || sports.default
    };
  } catch (error) {
    console.error('❌ Failed to load seed data:', error.message);
    console.error('   Make sure seed data files are included in the build');
    process.exit(1);
  }
}

async function seedCountries(data) {
  console.log('📍 Seeding countries...');
  const client = await pool.connect();
  let count = 0;
  const idMap = new Map();

  try {
    for (let i = 0; i < data.length; i++) {
      const country = data[i];
      const csvId = i + 1;

      const result = await client.query(
        'SELECT id FROM countries WHERE country_slug = $1',
        [country.countrySlug]
      );

      if (result.rows.length === 0) {
        const insert = await client.query(
          `INSERT INTO countries (country_slug, country_name_en, country_name_es, flag)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [country.countrySlug, country.countryNameEn, country.countryNameEs, country.flag]
        );
        idMap.set(csvId, insert.rows[0].id);
        count++;
      } else {
        idMap.set(csvId, result.rows[0].id);
      }
    }

    console.log(`✅ Countries: ${count} new, ${data.length - count} existing\n`);
    return idMap;
  } finally {
    client.release();
  }
}

async function seedRegions(data, countryIdMap) {
  console.log('📍 Seeding regions...');
  const client = await pool.connect();
  let count = 0;
  const idMap = new Map();

  try {
    for (let i = 0; i < data.length; i++) {
      const region = data[i];
      const csvId = i + 1;

      const newCountryId = countryIdMap.get(region.countryId);
      if (!newCountryId) {
        console.error(`❌ Country ID ${region.countryId} not found for region ${region.regionSlug}`);
        continue;
      }

      const result = await client.query(
        'SELECT id FROM regions WHERE region_slug = $1',
        [region.regionSlug]
      );

      if (result.rows.length === 0) {
        const insert = await client.query(
          `INSERT INTO regions (country_id, region_slug, region_name_en, region_name_es)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [newCountryId, region.regionSlug, region.regionNameEn, region.regionNameEs]
        );
        idMap.set(csvId, insert.rows[0].id);
        count++;
      } else {
        idMap.set(csvId, result.rows[0].id);
      }
    }

    console.log(`✅ Regions: ${count} new, ${data.length - count} existing\n`);
    return idMap;
  } finally {
    client.release();
  }
}

async function seedResorts(data, countryIdMap, regionIdMap) {
  console.log('📍 Seeding resorts...');
  const client = await pool.connect();
  let count = 0;
  let errors = 0;

  try {
    for (const resort of data) {
      const newCountryId = countryIdMap.get(resort.countryId);
      if (!newCountryId) {
        console.error(`❌ Country ID ${resort.countryId} not found for ${resort.slug}`);
        errors++;
        continue;
      }

      let newRegionId = null;
      if (resort.regionId) {
        newRegionId = regionIdMap.get(resort.regionId);
        if (!newRegionId) {
          console.error(`❌ Region ID ${resort.regionId} not found for ${resort.slug}`);
          errors++;
          continue;
        }
      }

      const result = await client.query(
        'SELECT id FROM resorts WHERE slug = $1',
        [resort.slug]
      );

      if (result.rows.length === 0) {
        await client.query(
          `INSERT INTO resorts (
            country_id, region_id, slug, name, description,
            website_url, logo_url, elevation_min, elevation_max,
            total_slopes, green_slopes, blue_slopes, red_slopes, black_slopes,
            total_lifts, snowpark, night_skiing, cross_country, location
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          [
            newCountryId, newRegionId, resort.slug, resort.name, resort.description,
            resort.websiteUrl, resort.logoUrl, resort.elevationMin, resort.elevationMax,
            resort.totalSlopes, resort.greenSlopes, resort.blueSlopes, resort.redSlopes, resort.blackSlopes,
            resort.totalLifts, resort.snowpark, resort.nightSkiing, resort.crossCountry, resort.location
          ]
        );
        count++;
      }
    }

    console.log(`✅ Resorts: ${count} new, ${data.length - count - errors} existing, ${errors} errors\n`);
  } finally {
    client.release();
  }
}

async function seedSports(data) {
  console.log('📍 Seeding sports...');
  const client = await pool.connect();
  let count = 0;

  try {
    for (const sport of data) {
      const result = await client.query(
        'SELECT id FROM sports WHERE sport_slug = $1',
        [sport.sportSlug]
      );

      if (result.rows.length === 0) {
        await client.query(
          `INSERT INTO sports (sport_slug, sport_name_en, sport_name_es)
           VALUES ($1, $2, $3)`,
          [sport.sportSlug, sport.sportNameEn, sport.sportNameEs]
        );
        count++;
      }
    }

    console.log(`✅ Sports: ${count} new, ${data.length - count} existing\n`);
  } finally {
    client.release();
  }
}

async function runSeeds() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Load seed data
    const data = await loadSeedData();

    // Seed in order (maintains referential integrity)
    const countryIdMap = await seedCountries(data.countries);
    const regionIdMap = await seedRegions(data.regions, countryIdMap);
    await seedResorts(data.resorts, countryIdMap, regionIdMap);
    await seedSports(data.sports);

    console.log('🎉 Database seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seeds
runSeeds();
