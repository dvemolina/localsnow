// Script to clear countries, regions, and resorts data
import { db } from "$src/lib/server/db/index";
import {
  countries as countriesTable,
  regions as regionsTable,
  resorts as resortsTable
} from "$src/lib/server/db/schema";

async function clearData() {
  console.log('🗑️  Starting database cleanup...\n');

  try {
    // Delete in order: resorts → regions → countries (due to foreign keys)

    console.log('📍 Deleting resorts...');
    const deletedResorts = await db.delete(resortsTable);
    console.log(`✅ Resorts deleted\n`);

    console.log('📍 Deleting regions...');
    const deletedRegions = await db.delete(regionsTable);
    console.log(`✅ Regions deleted\n`);

    console.log('📍 Deleting countries...');
    const deletedCountries = await db.delete(countriesTable);
    console.log(`✅ Countries deleted\n`);

    console.log('🎉 Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

clearData();
