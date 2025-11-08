/**
 * Import Countries, Regions, and Resorts from CSV files exported from Google Sheets
 *
 * Usage:
 *   1. Export your Google Sheets to CSV:
 *      - countries.csv
 *      - regions.csv
 *      - resorts_app.csv
 *
 *   2. Place CSV files in /scripts/data/ directory
 *
 *   3. Run: ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts
 *
 * Options:
 *   --countries-only    Import only countries
 *   --regions-only      Import only regions
 *   --resorts-only      Import only resorts
 *   --spain-only        Import only Spanish resorts (default: true)
 *   --dry-run           Preview without importing
 */

import { db } from '../src/lib/server/db/index.js';
import { countries, regions, resorts } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Configuration
const CSV_DIR = path.join(process.cwd(), 'scripts', 'data');
const SPAIN_COUNTRY_CODE = 'ES'; // Adjust if different in your sheets

interface CountryRow {
	uuid?: string;
	id?: string;
	country: string;
	country_slug: string;
	country_code: string;
}

interface RegionRow {
	uuid?: string;
	id?: string;
	country_id: string;
	country?: string;
	region: string;
	region_slug: string;
}

interface ResortRow {
	name: string;
	slug: string;
	label?: string;
	minElevation?: string;
	maxElevation?: string;
	lat?: string;
	lon?: string;
	website?: string;
	countryId: string;
	regionId: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
	countriesOnly: args.includes('--countries-only'),
	regionsOnly: args.includes('--regions-only'),
	resortsOnly: args.includes('--resorts-only'),
	spainOnly: !args.includes('--all-countries'),
	dryRun: args.includes('--dry-run')
};

console.log('🚀 Import Configuration:', options);

/**
 * Read and parse CSV file
 */
function readCSV<T>(filename: string): T[] {
	const filePath = path.join(CSV_DIR, filename);

	if (!fs.existsSync(filePath)) {
		console.warn(`⚠️  File not found: ${filePath}`);
		return [];
	}

	const content = fs.readFileSync(filePath, 'utf-8');
	const records = parse(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	});

	return records as T[];
}

/**
 * Import Countries
 */
async function importCountries() {
	console.log('\n📍 Importing Countries...');

	const rows = readCSV<CountryRow>('countries.csv');

	if (rows.length === 0) {
		console.log('⚠️  No countries to import');
		return;
	}

	let imported = 0;
	let skipped = 0;

	for (const row of rows) {
		// Check if country already exists by code
		const existing = await db
			.select()
			.from(countries)
			.where(eq(countries.countryCode, row.country_code))
			.limit(1);

		if (existing.length > 0) {
			console.log(`  ⏭️  Skipping ${row.country} (already exists)`);
			skipped++;
			continue;
		}

		if (options.dryRun) {
			console.log(`  [DRY RUN] Would import: ${row.country} (${row.country_code})`);
			imported++;
		} else {
			await db.insert(countries).values({
				country: row.country,
				countryCode: row.country_code,
				countrySlug: row.country_slug
			});
			console.log(`  ✅ Imported: ${row.country} (${row.country_code})`);
			imported++;
		}
	}

	console.log(`\n✨ Countries: ${imported} imported, ${skipped} skipped`);
}

/**
 * Import Regions
 */
async function importRegions() {
	console.log('\n🗺️  Importing Regions...');

	const rows = readCSV<RegionRow>('regions.csv');

	if (rows.length === 0) {
		console.log('⚠️  No regions to import');
		return;
	}

	let imported = 0;
	let skipped = 0;

	for (const row of rows) {
		// Get country ID from database (not from sheet)
		// The sheet has country_id which is the OLD id, we need the NEW DB id
		const country = await db
			.select()
			.from(countries)
			.where(eq(countries.countryCode, row.country_slug?.toUpperCase() || ''))
			.limit(1);

		if (country.length === 0) {
			console.log(`  ⚠️  Skipping ${row.region} (country not found: ${row.country})`);
			skipped++;
			continue;
		}

		const dbCountryId = country[0].id;

		// Check if region already exists
		const existing = await db
			.select()
			.from(regions)
			.where(eq(regions.regionSlug, row.region_slug))
			.limit(1);

		if (existing.length > 0) {
			console.log(`  ⏭️  Skipping ${row.region} (already exists)`);
			skipped++;
			continue;
		}

		if (options.dryRun) {
			console.log(
				`  [DRY RUN] Would import: ${row.region} → ${country[0].country} (ID: ${dbCountryId})`
			);
			imported++;
		} else {
			await db.insert(regions).values({
				countryId: dbCountryId,
				region: row.region,
				regionSlug: row.region_slug
			});
			console.log(`  ✅ Imported: ${row.region} → ${country[0].country}`);
			imported++;
		}
	}

	console.log(`\n✨ Regions: ${imported} imported, ${skipped} skipped`);
}

/**
 * Import Resorts
 */
async function importResorts() {
	console.log('\n🏔️  Importing Resorts...');

	const rows = readCSV<ResortRow>('resorts_app.csv');

	if (rows.length === 0) {
		console.log('⚠️  No resorts to import');
		return;
	}

	let imported = 0;
	let skipped = 0;
	let filtered = 0;

	for (const row of rows) {
		// Get country and region from database
		const region = await db.select().from(regions).where(eq(regions.id, parseInt(row.regionId)));

		if (region.length === 0) {
			console.log(`  ⚠️  Skipping ${row.name} (region not found: ${row.regionId})`);
			skipped++;
			continue;
		}

		const country = await db
			.select()
			.from(countries)
			.where(eq(countries.id, region[0].countryId));

		if (country.length === 0) {
			console.log(`  ⚠️  Skipping ${row.name} (country not found)`);
			skipped++;
			continue;
		}

		// Filter for Spain only if option is set
		if (options.spainOnly && country[0].countryCode !== SPAIN_COUNTRY_CODE) {
			filtered++;
			continue;
		}

		// Check if resort already exists
		const existing = await db.select().from(resorts).where(eq(resorts.slug, row.slug)).limit(1);

		if (existing.length > 0) {
			console.log(`  ⏭️  Skipping ${row.name} (already exists)`);
			skipped++;
			continue;
		}

		if (options.dryRun) {
			console.log(
				`  [DRY RUN] Would import: ${row.name} → ${region[0].region}, ${country[0].country}`
			);
			imported++;
		} else {
			await db.insert(resorts).values({
				name: row.name,
				slug: row.slug,
				label: row.label || null,
				minElevation: row.minElevation ? parseInt(row.minElevation) : null,
				maxElevation: row.maxElevation ? parseInt(row.maxElevation) : null,
				lat: row.lat || null,
				lon: row.lon || null,
				website: row.website || null,
				countryId: country[0].id,
				regionId: region[0].id
			});
			console.log(`  ✅ Imported: ${row.name} → ${region[0].region}, ${country[0].country}`);
			imported++;
		}
	}

	console.log(`\n✨ Resorts: ${imported} imported, ${skipped} skipped, ${filtered} filtered`);
}

/**
 * Main execution
 */
async function main() {
	try {
		console.log('🌍 LocalSnow Resort Import Tool\n');
		console.log(`📂 Looking for CSV files in: ${CSV_DIR}\n`);

		// Create data directory if it doesn't exist
		if (!fs.existsSync(CSV_DIR)) {
			console.log(`📁 Creating directory: ${CSV_DIR}`);
			fs.mkdirSync(CSV_DIR, { recursive: true });
		}

		// Import in order: Countries → Regions → Resorts
		if (!options.regionsOnly && !options.resortsOnly) {
			await importCountries();
		}

		if (!options.countriesOnly && !options.resortsOnly) {
			await importRegions();
		}

		if (!options.countriesOnly && !options.regionsOnly) {
			await importResorts();
		}

		console.log('\n🎉 Import complete!\n');

		if (options.dryRun) {
			console.log('ℹ️  This was a dry run. No data was imported.');
			console.log('   Run without --dry-run to actually import data.\n');
		}
	} catch (error) {
		console.error('❌ Error during import:', error);
		process.exit(1);
	}
}

main();
