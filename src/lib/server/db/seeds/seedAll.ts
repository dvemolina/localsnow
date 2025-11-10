// Complete seed script for countries, regions, resorts, and sports
import { countries } from "./data/countries";
import { regions } from "./data/regions";
import { resorts } from "./data/resorts";
import { sports } from "./data/sports";
import {
  countries as countriesTable,
  regions as regionsTable,
  resorts as resortsTable,
  sports as sportsTable
} from "../schema";
import { db } from "../index";
import { eq } from "drizzle-orm";

async function seedCountries() {
  console.log('📍 Seeding countries...');
  let count = 0;

  for (const country of countries) {
    const existing = await db
      .select()
      .from(countriesTable)
      .where(eq(countriesTable.countryCode, country.countryCode));

    if (existing.length === 0) {
      await db.insert(countriesTable).values(country);
      count++;
    }
  }

  console.log(`✅ Countries seeded: ${count} new, ${countries.length - count} existing\n`);
}

async function seedRegions() {
  console.log('📍 Seeding regions...');
  let count = 0;

  for (const region of regions) {
    const existing = await db
      .select()
      .from(regionsTable)
      .where(eq(regionsTable.regionSlug, region.regionSlug));

    if (existing.length === 0) {
      await db.insert(regionsTable).values(region);
      count++;
    }
  }

  console.log(`✅ Regions seeded: ${count} new, ${regions.length - count} existing\n`);
}

async function seedResorts() {
  console.log('📍 Seeding resorts...');
  let count = 0;
  let errors = 0;

  for (const resort of resorts) {
    try {
      const existing = await db
        .select()
        .from(resortsTable)
        .where(eq(resortsTable.slug, resort.slug));

      if (existing.length === 0) {
        await db.insert(resortsTable).values(resort);
        count++;
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error inserting ${resort.name}:`, error);
    }
  }

  console.log(`✅ Resorts seeded: ${count} new, ${resorts.length - count - errors} existing, ${errors} errors\n`);
}

async function seedSports() {
  console.log('📍 Seeding sports...');
  let count = 0;

  for (const sport of sports) {
    const existing = await db
      .select()
      .from(sportsTable)
      .where(eq(sportsTable.sportSlug, sport.sportSlug));

    if (existing.length === 0) {
      await db.insert(sportsTable).values(sport);
      count++;
    }
  }

  console.log(`✅ Sports seeded: ${count} new, ${sports.length - count} existing\n`);
}

async function seedAll() {
  console.log('🌱 Starting complete database seed...\n');

  try {
    // Order matters! Countries → Regions → Resorts (sports can be anytime)
    await seedCountries();
    await seedRegions();
    await seedResorts();
    await seedSports();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAll();
