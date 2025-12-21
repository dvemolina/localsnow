-- Simple script to add Verbier resort to LocalSnow database
-- Run this with: psql $DATABASE_URL -f scripts/add-verbier-direct.sql

BEGIN;

-- Step 1: Add Switzerland (if not exists)
INSERT INTO "countries" ("country", "countryCode", "countrySlug", "uuid")
SELECT 'Switzerland', 'CH', 'switzerland', gen_random_uuid()
WHERE NOT EXISTS (
    SELECT 1 FROM "countries" WHERE UPPER("countryCode") = 'CH'
);

-- Step 2: Add Valais region (if not exists)
INSERT INTO "regions" ("countryId", "region", "regionSlug", "uuid")
SELECT
    c.id,
    'Valais',
    'valais',
    gen_random_uuid()
FROM "countries" c
WHERE UPPER(c."countryCode") = 'CH'
AND NOT EXISTS (
    SELECT 1 FROM "regions" WHERE "regionSlug" = 'valais'
);

-- Step 3: Add Verbier resort (if not exists)
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

-- Step 4: Verify it was added
\echo ''
\echo '========================================='
\echo 'Verbier Resort Added Successfully!'
\echo '========================================='
SELECT
    res.id AS resort_id,
    res.name,
    res.slug,
    res."minElevation" || 'm - ' || res."maxElevation" || 'm' AS elevation,
    c.country,
    reg.region
FROM resorts res
JOIN countries c ON res."countryId" = c.id
LEFT JOIN regions reg ON res."regionId" = reg.id
WHERE res.slug = 'verbier';

\echo ''
\echo 'Next steps to make Verbier appear in search:'
\echo '1. Sign in as an instructor'
\echo '2. Go to Dashboard → Profile → Edit'
\echo '3. Add Verbier to your resort list'
\echo '4. Verbier will then appear in /resorts and search'
\echo ''

COMMIT;
