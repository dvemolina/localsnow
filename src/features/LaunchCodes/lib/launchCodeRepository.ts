import { db } from "$lib/server/db";
import { launchCodes } from "$lib/server/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Repository for launch codes data access
 * Handles all database operations for the launch codes system
 */
export class LaunchCodeRepository {
    /**
     * Get a launch code by its code string
     */
    async getByCode(code: string) {
        const result = await db
            .select()
            .from(launchCodes)
            .where(eq(launchCodes.code, code.toUpperCase().trim()));

        return result[0] ?? null;
    }

    /**
     * Get an active launch code that is still valid
     */
    async getActiveCode(code: string) {
        const result = await db
            .select()
            .from(launchCodes)
            .where(
                and(
                    eq(launchCodes.code, code.toUpperCase().trim()),
                    eq(launchCodes.isActive, true)
                )
            );

        return result[0] ?? null;
    }

    /**
     * Increment the usage counter for a launch code
     */
    async incrementUsage(codeId: number): Promise<void> {
        await db
            .update(launchCodes)
            .set({
                currentUses: sql`${launchCodes.currentUses} + 1`
            })
            .where(eq(launchCodes.id, codeId));
    }

    /**
     * Check if a code has reached its usage limit
     */
    async hasReachedLimit(codeId: number): Promise<boolean> {
        const code = await db
            .select()
            .from(launchCodes)
            .where(eq(launchCodes.id, codeId));

        if (!code[0]) return true;

        const { maxUses, currentUses } = code[0];

        // If maxUses is null, there's no limit
        if (maxUses === null) return false;

        return currentUses >= maxUses;
    }

    /**
     * Get all active launch codes
     */
    async getAllActive() {
        return await db
            .select()
            .from(launchCodes)
            .where(eq(launchCodes.isActive, true));
    }

    /**
     * Deactivate a launch code
     */
    async deactivate(codeId: number): Promise<void> {
        await db
            .update(launchCodes)
            .set({ isActive: false })
            .where(eq(launchCodes.id, codeId));
    }
}
