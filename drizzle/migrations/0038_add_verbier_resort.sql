-- Add Switzerland, Valais region, and Verbier resort for worldwide expansion
-- This migration is idempotent - safe to run multiple times

-- Step 1: Ensure Switzerland exists in countries table
INSERT INTO "countries" ("country", "countryCode", "countrySlug", "uuid")
SELECT 'Switzerland', 'CH', 'switzerland', gen_random_uuid()
WHERE NOT EXISTS (
    SELECT 1 FROM "countries" WHERE UPPER("countryCode") = 'CH'
);

-- Step 2: Add Valais region to Switzerland
-- First get Switzerland's country ID, then insert region
INSERT INTO "regions" ("countryId", "region", "regionSlug", "uuid")
SELECT
    c.id,
    'Valais',
    'valais',
    gen_random_uuid()
FROM "countries" c
WHERE UPPER(c."countryCode") = 'CH'
AND NOT EXISTS (
    SELECT 1 FROM "regions"
    WHERE "regionSlug" = 'valais'
);

-- Step 3: Add Verbier resort
-- Get Switzerland's country ID and Valais region ID, then insert resort
INSERT INTO "resorts" (
    "name",
    "slug",
    "label",
    "description",
    "minElevation",
    "maxElevation",
    "lat",
    "lon",
    "website",
    "countryId",
    "regionId",
    "uuid"
)
SELECT
    'Verbier',
    'verbier',
    'Verbier',
    'One of the world''s premier ski resorts, known for exceptional off-piste terrain and stunning Alpine views in the Four Valleys ski area.',
    1500,
    3330,
    46.0964,
    7.2280,
    'https://www.verbier.ch',
    c.id,
    r.id,
    gen_random_uuid()
FROM "countries" c
CROSS JOIN "regions" r
WHERE UPPER(c."countryCode") = 'CH'
AND r."regionSlug" = 'valais'
AND NOT EXISTS (
    SELECT 1 FROM "resorts" WHERE "slug" = 'verbier'
);

-- Add comment for documentation
COMMENT ON TABLE "resorts" IS 'Ski resorts worldwide - expanded from Spain-only to support global instructors';
