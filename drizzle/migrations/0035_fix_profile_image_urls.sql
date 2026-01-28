-- Migration: Fix profile image URLs to use full CDN domain
-- Description: Updates any profileImageUrl that starts with a relative path
--              to use the full assets.localsnow.org domain
-- Date: 2026-01-28

-- Update profile image URLs that start with /profileImgs/ to use full CDN URL
UPDATE users
SET profile_image_url = CONCAT('https://assets.localsnow.org', profile_image_url)
WHERE profile_image_url LIKE '/profileImgs/%';

-- Also update qualification URLs if they have the same issue
UPDATE users
SET qualification_url = CONCAT('https://assets.localsnow.org', qualification_url)
WHERE qualification_url LIKE '/qualifications/%';
