# Resort Import Script

Import countries, regions, and resorts from Google Sheets to your database.

## Setup

### 1. Export Google Sheets to CSV

In your Google Sheets:

**Countries Sheet:**
- File → Download → Comma Separated Values (.csv)
- Save as: `countries.csv`

**Regions Sheet:**
- File → Download → Comma Separated Values (.csv)
- Save as: `regions.csv`

**Resorts App Sheet:**
- File → Download → Comma Separated Values (.csv)
- Save as: `resorts_app.csv`

### 2. Place CSV Files

Move all 3 CSV files to: `/scripts/data/`

```bash
mkdir -p scripts/data
# Then move your CSV files there
```

### 3. Install CSV Parser

```bash
pnpm add csv-parse
```

## Usage

### Preview Import (Dry Run)

See what would be imported without actually importing:

```bash
pnpm ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts --dry-run
```

### Import Everything (Spain Only)

Import all countries, all regions, and only Spanish resorts:

```bash
pnpm ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts
```

### Import All Resorts (All Countries)

Import resorts from all countries:

```bash
pnpm ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts --all-countries
```

### Import Only Countries

```bash
pnpm ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts --countries-only
```

### Import Only Regions

```bash
pnpm ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts --regions-only
```

### Import Only Resorts

```bash
pnpm ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts --resorts-only
```

## How It Works

### Column Mapping

The script automatically maps between your Google Sheets structure and the database schema:

**Countries:**
```
Google Sheets          →  Database
country_code           →  countryCode
country_slug           →  countrySlug
country                →  country
```

**Regions:**
```
Google Sheets          →  Database
region_slug            →  regionSlug
region                 →  region
country_id (ignored)   →  countryId (auto-resolved from DB)
```

**Resorts:**
```
Google Sheets          →  Database
name                   →  name
slug                   →  slug
label                  →  label
minElevation           →  minElevation (parsed as int)
maxElevation           →  maxElevation (parsed as int)
lat                    →  lat
lon                    →  lon
website                →  website
countryId              →  countryId (auto-resolved from DB)
regionId               →  regionId (auto-resolved from DB)
```

### Duplicate Handling

- **Countries:** Checked by `country_code`
- **Regions:** Checked by `region_slug`
- **Resorts:** Checked by `slug`

If a duplicate is found, it's skipped with a message.

### Spain Filtering

By default, only resorts in Spain (country code = 'ES') are imported.

**Note:** The script looks up the country code from the database based on the region, so make sure countries and regions are imported first!

## Troubleshooting

### "File not found"

Make sure your CSV files are in `/scripts/data/`:

```bash
ls scripts/data/
# Should show: countries.csv  regions.csv  resorts_app.csv
```

### "Country not found"

Import countries first:

```bash
pnpm ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts --countries-only
```

### "Region not found"

Import regions after countries:

```bash
pnpm ts-node --esm -r tsconfig-paths/register scripts/import-resorts.ts --regions-only
```

### "All resorts skipped"

Check if your Spain country code is correct. Edit the script and change `SPAIN_COUNTRY_CODE` if needed:

```typescript
const SPAIN_COUNTRY_CODE = 'ES'; // Change to match your sheets
```

### "Module not found: csv-parse"

Install the dependency:

```bash
pnpm add csv-parse
```

## Example Output

```
🌍 LocalSnow Resort Import Tool

📂 Looking for CSV files in: /scripts/data

📍 Importing Countries...
  ✅ Imported: Spain (ES)
  ✅ Imported: France (FR)
  ✅ Imported: Italy (IT)
  ⏭️  Skipping Austria (already exists)

✨ Countries: 3 imported, 1 skipped

🗺️  Importing Regions...
  ✅ Imported: Catalonia → Spain
  ✅ Imported: Aragon → Spain
  ✅ Imported: Andalusia → Spain

✨ Regions: 3 imported, 0 skipped

🏔️  Importing Resorts...
  ✅ Imported: Baqueira-Beret → Aragon, Spain
  ✅ Imported: Sierra Nevada → Andalusia, Spain
  ✅ Imported: Formigal → Aragon, Spain
  ⏭️  Skipping Chamonix (filtered: not Spain)

✨ Resorts: 3 imported, 0 skipped, 1 filtered

🎉 Import complete!
```

## Next Steps

After importing:

1. **Verify data:**
   ```bash
   # Check in database
   SELECT COUNT(*) FROM countries;
   SELECT COUNT(*) FROM regions;
   SELECT COUNT(*) FROM resorts;
   ```

2. **Test on frontend:**
   - Visit `/instructors` and check resort dropdowns
   - Create SEO pages for resorts
   - Test filtering by resort

3. **Future imports:**
   - You can re-run the script anytime
   - Duplicates will be skipped automatically
   - To add more countries, use `--all-countries` flag
