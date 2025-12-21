-- Verification script for Verbier resort setup
-- Run this with: psql $DATABASE_URL -f scripts/verify-verbier.sql

\echo '======================================'
\echo 'Checking if Switzerland exists...'
\echo '======================================'
SELECT id, country, "countryCode", "countrySlug"
FROM countries
WHERE UPPER("countryCode") = 'CH';

\echo ''
\echo '======================================'
\echo 'Checking if Valais region exists...'
\echo '======================================'
SELECT r.id, r.region, r."regionSlug", c.country
FROM regions r
JOIN countries c ON r."countryId" = c.id
WHERE r."regionSlug" = 'valais';

\echo ''
\echo '======================================'
\echo 'Checking if Verbier resort exists...'
\echo '======================================'
SELECT
    res.id,
    res.name,
    res.slug,
    res."minElevation",
    res."maxElevation",
    res.lat,
    res.lon,
    c.country,
    reg.region
FROM resorts res
JOIN countries c ON res."countryId" = c.id
LEFT JOIN regions reg ON res."regionId" = reg.id
WHERE res.slug = 'verbier';

\echo ''
\echo '======================================'
\echo 'Checking instructors at Verbier...'
\echo '======================================'
SELECT
    u.id,
    u.name,
    u."lastName",
    u.email,
    u.role,
    u."deletedAt"
FROM users u
JOIN instructor_resorts ir ON u.id = ir."instructorId"
JOIN resorts r ON ir."resortId" = r.id
WHERE r.slug = 'verbier'
AND u."deletedAt" IS NULL
AND u.role IN ('instructor-independent', 'instructor-school');

\echo ''
\echo '======================================'
\echo 'Summary: Why Verbier might not appear'
\echo '======================================'
\echo 'The resorts page only shows resorts with at least 1 active instructor.'
\echo 'If no instructors are listed above, you need to:'
\echo '1. Create an instructor account (or use existing one)'
\echo '2. Add Verbier to their resort list in their profile'
\echo '3. Then Verbier will appear in search results'
