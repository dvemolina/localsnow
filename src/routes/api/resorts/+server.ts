import { db } from '$src/lib/server/db';
import { countries, regions, resorts } from '$src/lib/server/db/schema';
import type { InferInsertModel } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

type SheetResort = {
	name: string;
	slug: string;
	label: string;
	min_elevation: number;
	max_elevation: number;
	lat: number;
	lon: number;
	website: string;
	country_slug: string;
	region_slug: string;
	created_at: string;
	updated_at: string;
};


export const POST: RequestHandler = async ({ request }) => {
	try {
		const resortsList = await request.json();
        console.log('RESORTS: ', resortsList)

		if (!Array.isArray(resortsList) || resortsList.length === 0) {
			return new Response(JSON.stringify({ error: 'No resorts provided' }), { status: 400 });
		}

		// Fetch countries and regions once
		const [allCountries, allRegions] = await Promise.all([
			db.select().from(countries),
			db.select().from(regions)
		]);

		const countryMap = new Map(allCountries.map(c => [c.countrySlug, c.id]));
		const regionMap = new Map(allRegions.map(r => [`${r.regionSlug}|${r.countryId}`, r.id]));

		const insertData: InferInsertModel<typeof resorts>[] = [];

		for (const resort of resortsList) {
			const countryId = countryMap.get(resort.country_slug);
			if (!countryId) {
				console.warn(`Skipping: Country not found for "${resort.country_slug}"`);
				continue;
			}

			const regionId = regionMap.get(`${resort.region_slug}|${countryId}`);
			if (!regionId) {
				console.warn(`Skipping: Region not found for "${resort.region_slug}" in "${resort.country_slug}"`);
				continue;
			}

			insertData.push({
				name: resort.name,
				slug: resort.slug,
				label: resort.label,
				minElevation: resort.min_elevation || null,
				maxElevation: resort.max_elevation || null,
				lat: resort.lat,
				lon: resort.lon,
				website: resort.website,
				countryId,
				regionId,
				createdAt: new Date(resort.created_at),
				updatedAt: new Date(resort.updated_at)
			});
		}

		if (insertData.length === 0) {
			return new Response(JSON.stringify({ error: 'No valid resorts to insert' }), { status: 400 });
		}

		const inserted = await db.insert(resorts).values(insertData).returning();

		return new Response(JSON.stringify(inserted), {
			status: 201
		});
	} catch (err) {
		console.error('Failed to insert resorts:', err);
	    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
	}
};
