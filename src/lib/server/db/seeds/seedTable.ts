import type { PgTable, TableConfig } from "drizzle-orm/pg-core";
import { db } from "..";


export async function seedTable(table: PgTable<TableConfig>, data: unknown[], tableName: string) {
  try {
    if (!db) return null;
    // Check if the table already contains data
    const existingRecords = await db.select().from(table);

    if (existingRecords.length === 0) {
      console.log(`Seeding ${tableName}...`);
      await db.insert(table).values(data);
      console.log(`${tableName} seeded successfully`);
    } else {
      console.log(`${tableName} table already populated, skipping seed`);
    }
  } catch (error) {
    console.error(`Error seeding ${tableName}:`, error);
    throw error;
  }
}