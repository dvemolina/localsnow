#!/usr/bin/env tsx
/**
 * Script to fix profile image URLs that are stored as relative paths
 *
 * This script updates any profileImageUrl in the users table that starts with a relative path
 * (e.g., /profileImgs/1-profileImg) to use the full CDN URL with assets.localsnow.org domain
 *
 * Run with: tsx scripts/fix-profile-image-urls.ts
 */

import { db } from '../src/lib/server/db/index.js';
import { users } from '../src/lib/server/db/schema.js';
import { sql } from 'drizzle-orm';

const ASSETS_DOMAIN = 'https://assets.localsnow.org';

async function fixProfileImageUrls() {
    console.log('🔍 Searching for profile images with relative URLs...\n');

    try {
        // Find all users with relative profile image URLs
        const usersWithRelativeUrls = await db
            .select({
                id: users.id,
                name: users.name,
                lastName: users.lastName,
                profileImageUrl: users.profileImageUrl
            })
            .from(users)
            .where(sql`${users.profileImageUrl} LIKE '/profileImgs/%'`);

        if (usersWithRelativeUrls.length === 0) {
            console.log('✅ No users found with relative profile image URLs. All URLs are already correct!');
            return;
        }

        console.log(`Found ${usersWithRelativeUrls.length} user(s) with relative profile image URLs:\n`);

        // Display what will be changed
        for (const user of usersWithRelativeUrls) {
            const newUrl = `${ASSETS_DOMAIN}${user.profileImageUrl}`;
            console.log(`User ID ${user.id} (${user.name} ${user.lastName}):`);
            console.log(`  Current: ${user.profileImageUrl}`);
            console.log(`  New:     ${newUrl}\n`);
        }

        // Ask for confirmation
        console.log('Would you like to proceed with updating these URLs? (This will modify the database)');
        console.log('Press Ctrl+C to cancel, or run with --confirm flag to auto-confirm\n');

        const hasConfirmFlag = process.argv.includes('--confirm');
        if (!hasConfirmFlag) {
            console.log('Waiting for confirmation... (run with --confirm to skip this prompt)');
            // In production, you could use readline or a prompt library here
            // For now, we'll require the --confirm flag
            console.log('\n⚠️  Dry run only. Use --confirm flag to actually update the database.');
            return;
        }

        // Perform the update
        console.log('🔄 Updating profile image URLs...\n');

        let updatedCount = 0;
        for (const user of usersWithRelativeUrls) {
            const newUrl = `${ASSETS_DOMAIN}${user.profileImageUrl}`;

            await db
                .update(users)
                .set({ profileImageUrl: newUrl })
                .where(sql`${users.id} = ${user.id}`);

            updatedCount++;
            console.log(`✓ Updated user ${user.id} (${user.name} ${user.lastName})`);
        }

        console.log(`\n✅ Successfully updated ${updatedCount} profile image URL(s)!`);

    } catch (error) {
        console.error('❌ Error fixing profile image URLs:', error);
        throw error;
    }
}

// Run the script
fixProfileImageUrls()
    .then(() => {
        console.log('\n✨ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
