# Profile Image URL Fix Guide

## Problem Description

Profile images are showing with incorrect URLs in production:
- **Broken URL**: `https://localsnow.org/en/profileImgs/1-profileImg`
- **Correct URL**: `https://assets.localsnow.org/profileImgs/1-profileImg`

The issue occurs when profile image URLs are stored as relative paths (e.g., `/profileImgs/1-profileImg`) in the database. When rendered in the browser on localized routes, these relative paths are interpreted as relative to the current domain, causing the locale prefix to be added.

## Root Cause

1. The `R2_PUBLIC_URL` environment variable may not have been set correctly in production
2. Existing profile image URLs in the database are stored as relative paths instead of full URLs

## Solution

### Step 1: Verify R2_PUBLIC_URL Configuration

Ensure the `R2_PUBLIC_URL` environment variable is set correctly in your production Docker secrets:

```bash
R2_PUBLIC_URL=https://assets.localsnow.org
```

**Important**: Do NOT include a trailing slash.

To verify the current value in production:

```bash
# SSH into your production container
docker exec -it <container-name> sh

# Check the environment variable (if accessible)
echo $R2_PUBLIC_URL
```

If the value is incorrect, update your Docker secret:

```bash
# Update the secret using your deployment script
./scripts/deploy-secrets.sh
```

Or manually update the Docker secret file and recreate the container.

### Step 2: Fix Existing Database URLs

You have two options to fix existing relative URLs in the database:

#### Option A: Run the TypeScript Migration Script (Recommended)

```bash
# Dry run (shows what will be changed without modifying the database)
tsx scripts/fix-profile-image-urls.ts

# Actually update the database
tsx scripts/fix-profile-image-urls.ts --confirm
```

#### Option B: Run the SQL Migration Directly

If you prefer to run SQL directly on your production database:

```bash
# Connect to your database
psql $DATABASE_URL

# Run the migration
\i drizzle/migrations/0035_fix_profile_image_urls.sql
```

Or using a database client, execute:

```sql
-- Fix profile image URLs
UPDATE users
SET profile_image_url = CONCAT('https://assets.localsnow.org', profile_image_url)
WHERE profile_image_url LIKE '/profileImgs/%';

-- Fix qualification URLs (if needed)
UPDATE users
SET qualification_url = CONCAT('https://assets.localsnow.org', qualification_url)
WHERE qualification_url LIKE '/qualifications/%';
```

### Step 3: Verify the Fix

After running the migration, verify that profile images are displaying correctly:

1. Visit the instructors page: `https://localsnow.org/en/instructors`
2. Search for instructors
3. Check that profile images load correctly
4. Right-click on a profile image and select "Open image in new tab"
5. Verify the URL is: `https://assets.localsnow.org/profileImgs/X-profileImg`

You can also verify in the database:

```sql
-- Check for any remaining relative URLs
SELECT id, name, last_name, profile_image_url
FROM users
WHERE profile_image_url LIKE '/profileImgs/%';

-- Should return 0 rows if the fix was successful
```

## Prevention

To prevent this issue from happening again:

1. **Always ensure R2_PUBLIC_URL is set correctly** in all environments (production, staging, etc.)
2. **The StorageService already returns full URLs** - as long as R2_PUBLIC_URL is configured properly, all new uploads will use full URLs
3. **Consider adding validation** to ensure URLs are absolute before storing them in the database

## Files Modified

- `scripts/fix-profile-image-urls.ts` - TypeScript migration script
- `drizzle/migrations/0035_fix_profile_image_urls.sql` - SQL migration file
- This documentation file

## Related Files

- [src/lib/server/R2Storage.ts](src/lib/server/R2Storage.ts:43) - uploadProfileImage() returns full URL
- [src/lib/server/config.ts](src/lib/server/config.ts:66) - R2_PUBLIC_URL configuration
- [src/features/Instructors/components/InstructorCard.svelte](src/features/Instructors/components/InstructorCard.svelte:54) - Where profile images are rendered

## Technical Details

The profile image upload flow:

1. User uploads image → `dashboard/profile/+page.server.ts` or `choose-role/instructor/+page.server.ts`
2. Image is processed → `StorageService.uploadProfileImage()`
3. Image is uploaded to Cloudflare R2
4. URL is returned: `${R2_PUBLIC_URL}/profileImgs/${userId}-profileImg`
5. URL is stored in database `users.profile_image_url`
6. URL is displayed in `InstructorCard.svelte` component

If `R2_PUBLIC_URL` is empty or incorrect, the returned URL will be relative (e.g., `/profileImgs/1-profileImg`) instead of absolute (e.g., `https://assets.localsnow.org/profileImgs/1-profileImg`).

## Support

If you encounter any issues with this fix, check:

1. R2_PUBLIC_URL is correctly set in production
2. The migration was successfully applied
3. Browser cache is cleared
4. CDN cache is cleared (if using Cloudflare CDN)
5. The R2 bucket is publicly accessible at assets.localsnow.org
