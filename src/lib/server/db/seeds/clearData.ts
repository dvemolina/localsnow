// Script to clear countries, regions, and resorts data
import { db } from "$src/lib/server/db/index";
import {
  countries as countriesTable,
  regions as regionsTable,
  resorts as resortsTable,
  instructorResorts,
  schoolResorts
} from "$src/lib/server/db/schema";

async function clearData() {
  console.log('🗑️  Starting database cleanup...\n');

  try {
    // Delete in order: junction tables → resorts → regions → countries
    // Must respect foreign key constraints

    console.log('📍 Deleting instructor-resort associations...');
    await db.delete(instructorResorts);
    console.log(`✅ Instructor-resort associations deleted\n`);

    console.log('📍 Deleting school-resort associations...');
    await db.delete(schoolResorts);
    console.log(`✅ School-resort associations deleted\n`);

    console.log('📍 Deleting resorts...');
    await db.delete(resortsTable);
    console.log(`✅ Resorts deleted\n`);

    console.log('📍 Deleting regions...');
    await db.delete(regionsTable);
    console.log(`✅ Regions deleted\n`);

    console.log('📍 Deleting countries...');
    await db.delete(countriesTable);
    console.log(`✅ Countries deleted\n`);

    console.log('🎉 Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

clearData();
