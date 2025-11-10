// Script to import CSV data into TypeScript seed files
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CSVRow {
  [key: string]: string;
}

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  const data: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: CSVRow = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });

    data.push(row);
  }

  return data;
}

// Handle CSV lines with quoted commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function generateCountriesSeed() {
  const csvPath = path.join(__dirname, 'csv-import', 'countries.csv');
  const data = parseCSV(csvPath);

  const countries = data.map(row => ({
    country: row.country,
    countrySlug: row.country_slug,
    countryCode: row.country_code
  }));

  const output = `export const countries = ${JSON.stringify(countries, null, 2)};`;

  fs.writeFileSync(
    path.join(__dirname, 'data', 'countries.ts'),
    output
  );

  console.log(`✅ Generated countries.ts with ${countries.length} countries`);
}

function generateRegionsSeed() {
  const csvPath = path.join(__dirname, 'csv-import', 'regions.csv');
  const data = parseCSV(csvPath);

  const regions = data.map(row => ({
    countryId: parseInt(row.country_id),
    region: row.region,
    regionSlug: row.region_slug
  }));

  const output = `export const regions = ${JSON.stringify(regions, null, 2)};`;

  fs.writeFileSync(
    path.join(__dirname, 'data', 'regions.ts'),
    output
  );

  console.log(`✅ Generated regions.ts with ${regions.length} regions`);
}

function generateResortsSeed() {
  const csvPath = path.join(__dirname, 'csv-import', 'resorts.csv');
  const data = parseCSV(csvPath);

  const resorts = data
    .filter(row => row.name && row.slug) // Only rows with name and slug
    .map(row => {
      const resort: any = {
        name: row.name,
        slug: row.slug,
        countryId: parseInt(row.countryId)
      };

      // Optional fields
      if (row.label) resort.label = row.label;
      if (row.regionId && row.regionId.trim()) {
        resort.regionId = parseInt(row.regionId);
      }
      if (row.minElevation && row.minElevation.trim()) {
        resort.minElevation = parseInt(row.minElevation);
      }
      if (row.maxElevation && row.maxElevation.trim()) {
        resort.maxElevation = parseInt(row.maxElevation);
      }
      if (row.lat && row.lat.trim()) {
        resort.lat = row.lat;
      }
      if (row.lon && row.lon.trim()) {
        resort.lon = row.lon;
      }
      if (row.website && row.website.trim()) {
        resort.website = row.website;
      }

      return resort;
    });

  const output = `export const resorts = ${JSON.stringify(resorts, null, 2)};`;

  fs.writeFileSync(
    path.join(__dirname, 'data', 'resorts.ts'),
    output
  );

  console.log(`✅ Generated resorts.ts with ${resorts.length} resorts`);
}

// Run all generators
console.log('🚀 Starting CSV import...\n');
generateCountriesSeed();
generateRegionsSeed();
generateResortsSeed();
console.log('\n✅ All seed files generated successfully!');
