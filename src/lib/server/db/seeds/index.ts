import { countries } from "$src/lib/server/db/seeds/data/countries"; // Your seed data
import { countries as countriesTable } from "$src/lib/server/db/schema"; // Drizzle table
import { db } from "$src/lib/server/db/index"; // Drizzle DB instance
import { eq } from "drizzle-orm";

async function seedCountries() {
  for (const country of countries) {
    const existing = await db
      .select()
      .from(countriesTable)
      .where(eq(countriesTable.countryCode, country.countryCode)); 

    if (existing.length === 0) {
      await db.insert(countriesTable).values(country);
    }
  }

  console.log('✅ Countries seeded.');
}

seedCountries()
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
  });
