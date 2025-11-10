// Complete seed script for countries, regions, resorts, and sports
import { countries } from "$src/lib/server/db/seeds/data/countries";
import { regions } from "$src/lib/server/db/seeds/data/regions";
import { resorts } from "$src/lib/server/db/seeds/data/resorts";
import { sports } from "$src/lib/server/db/seeds/data/sports";
import {
  countries as countriesTable,
  regions as regionsTable,
  resorts as resortsTable,
  sports as sportsTable
} from "$src/lib/server/db/schema";
import { db } from "$src/lib/server/db/index";
import { eq } from "drizzle-orm";

// Type for ID mappings
type IdMap = Map<number, number>;

async function seedCountries(): Promise<IdMap> {
  console.log('📍 Seeding countries...');
  let count = 0;
  const csvIdToDbId: IdMap = new Map();

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    const csvId = i + 1; // CSV IDs start at 1

    const existing = await db
      .select()
      .from(countriesTable)
      .where(eq(countriesTable.countrySlug, country.countrySlug));

    if (existing.length === 0) {
      const [inserted] = await db.insert(countriesTable).values(country).returning({ id: countriesTable.id });
      csvIdToDbId.set(csvId, inserted.id);
      count++;
    } else {
      csvIdToDbId.set(csvId, existing[0].id);
    }
  }

  console.log(`✅ Countries seeded: ${count} new, ${countries.length - count} existing\n`);
  return csvIdToDbId;
}

async function seedRegions(countryIdMap: IdMap): Promise<IdMap> {
  console.log('📍 Seeding regions...');
  let count = 0;
  const csvIdToDbId: IdMap = new Map();

  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const csvId = i + 1; // CSV IDs start at 1

    // Map the old countryId to the new database ID
    const newCountryId = countryIdMap.get(region.countryId);
    if (!newCountryId) {
      console.error(`❌ Country ID ${region.countryId} not found for region ${region.regionSlug}`);
      continue;
    }

    const existing = await db
      .select()
      .from(regionsTable)
      .where(eq(regionsTable.regionSlug, region.regionSlug));

    if (existing.length === 0) {
      const [inserted] = await db.insert(regionsTable).values({
        ...region,
        countryId: newCountryId
      }).returning({ id: regionsTable.id });
      csvIdToDbId.set(csvId, inserted.id);
      count++;
    } else {
      csvIdToDbId.set(csvId, existing[0].id);
    }
  }

  console.log(`✅ Regions seeded: ${count} new, ${regions.length - count} existing\n`);
  return csvIdToDbId;
}

async function seedResorts(countryIdMap: IdMap, regionIdMap: IdMap) {
  console.log('📍 Seeding resorts...');
  let count = 0;
  let errors = 0;

  for (const resort of resorts) {
    try {
      // Map the old countryId to the new database ID
      const newCountryId = countryIdMap.get(resort.countryId);
      if (!newCountryId) {
        console.error(`❌ Country ID ${resort.countryId} not found for resort ${resort.slug}`);
        errors++;
        continue;
      }

      // Map the old regionId to the new database ID (if exists)
      let newRegionId = null;
      if (resort.regionId) {
        newRegionId = regionIdMap.get(resort.regionId);
        if (!newRegionId) {
          console.error(`❌ Region ID ${resort.regionId} not found for resort ${resort.slug}`);
          errors++;
          continue;
        }
      }

      const existing = await db
        .select()
        .from(resortsTable)
        .where(eq(resortsTable.slug, resort.slug));

      if (existing.length === 0) {
        await db.insert(resortsTable).values({
          ...resort,
          countryId: newCountryId,
          regionId: newRegionId
        });
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
    // We need to track ID mappings because the CSV IDs don't match database IDs
    const countryIdMap = await seedCountries();
    const regionIdMap = await seedRegions(countryIdMap);
    await seedResorts(countryIdMap, regionIdMap);
    await seedSports();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAll();
