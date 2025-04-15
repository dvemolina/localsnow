import { db } from "$src/lib/server/db";
import { countries, type Country, type InsertCountry } from "$src/lib/server/db/schema";
import type { RequestHandler } from "@sveltejs/kit";

async function addCountries(countriesList: InsertCountry[]): Promise<Country[]> {
    const result = await db.insert(countries).values(countriesList).returning()
    return result;
}

async function getAllCountries(): Promise<Country[]> {
    const result = await db.select().from(countries);
    return result;
}

/* async function getCountryById(countryId: number): Promise<Country> {
    const result = await db.select().from(countries).where(eq(countries.id, countryId));
    return result[0] ?? null
} */

export const GET: RequestHandler = async () => {
    try {
        const countriesList = await getAllCountries();

        return new Response(JSON.stringify(countriesList), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Failed to fetch countries' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
		const body = await request.json();

		if (!Array.isArray(body)) {
			return new Response(JSON.stringify({ error: 'Expected array of countries' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const inserted = await addCountries(body);

		return new Response(JSON.stringify(inserted), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Failed to add countries' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};