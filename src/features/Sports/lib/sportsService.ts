import { db } from "$lib/server/db";
import { sports } from "$lib/server/db/schema";
import { eq, inArray } from "drizzle-orm";

export interface SportWithDetails {
    id: number;
    name: string;
    slug: string;
}

export class SportsService {
    /**
     * Get all sports
     */
    async getAllSports(): Promise<SportWithDetails[]> {
        const result = await db.select({
            id: sports.id,
            name: sports.sport,
            slug: sports.sportSlug
        }).from(sports);

        return result.map(s => ({
            id: s.id,
            name: s.name,
            slug: s.slug
        }));
    }

    /**
     * Get sport by ID
     */
    async getSportById(sportId: number): Promise<SportWithDetails | null> {
        const result = await db.select({
            id: sports.id,
            name: sports.sport,
            slug: sports.sportSlug
        })
        .from(sports)
        .where(eq(sports.id, sportId))
        .limit(1);

        if (!result[0]) return null;

        return {
            id: result[0].id,
            name: result[0].name,
            slug: result[0].slug
        };
    }

    /**
     * Get sports by IDs (with names)
     */
    async getSportsByIds(sportIds: number[]): Promise<SportWithDetails[]> {
        if (!sportIds || sportIds.length === 0) return [];

        const result = await db.select({
            id: sports.id,
            name: sports.sport,
            slug: sports.sportSlug
        })
        .from(sports)
        .where(inArray(sports.id, sportIds));

        return result.map(s => ({
            id: s.id,
            name: s.name,
            slug: s.slug
        }));
    }

    /**
     * Get sport name by ID (convenience method)
     */
    async getSportName(sportId: number): Promise<string | null> {
        const sport = await this.getSportById(sportId);
        return sport?.name || null;
    }

    /**
     * Map sport IDs to names (convenience method)
     * Returns a Record<number, string> for easy lookup
     */
    async getSportsMap(sportIds: number[]): Promise<Record<number, string>> {
        const sportsData = await this.getSportsByIds(sportIds);
        return sportsData.reduce((acc, sport) => {
            acc[sport.id] = sport.name;
            return acc;
        }, {} as Record<number, string>);
    }

    /**
     * Get sport by slug
     */
    async getSportBySlug(slug: string): Promise<SportWithDetails | null> {
        const result = await db.select({
            id: sports.id,
            name: sports.sport,
            slug: sports.sportSlug
        })
        .from(sports)
        .where(eq(sports.sportSlug, slug))
        .limit(1);

        if (!result[0]) return null;

        return {
            id: result[0].id,
            name: result[0].name,
            slug: result[0].slug
        };
    }
}