import { db } from "$src/lib/server/db";
import { regions, type InsertRegion, type Region } from "$src/lib/server/db/schema";
import type { RequestHandler } from "@sveltejs/kit";

async function addRegions(regionsList: InsertRegion[]): Promise<Region[]> {
    const result = await db.insert(regions).values(regionsList).returning()
    return result;
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();

        if (!Array.isArray(body)) {
            return new Response(JSON.stringify({ error: 'Expected array of regions' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const inserted = await addRegions(body);

        return new Response(JSON.stringify(inserted), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to add regions' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};