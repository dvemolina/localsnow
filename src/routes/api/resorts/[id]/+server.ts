import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { resorts, regions, countries } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const resortId = parseInt(params.id);
	
	if (isNaN(resortId)) {
		return json({ error: 'Invalid resort ID' }, { status: 400 });
	}

	const result = await db
		.select({
			id: resorts.id,
			name: resorts.name,
			slug: resorts.slug,
			region: regions.region,
			country: countries.country
		})
		.from(resorts)
		.innerJoin(regions, eq(resorts.regionId, regions.id))
		.innerJoin(countries, eq(resorts.countryId, countries.id))
		.where(eq(resorts.id, resortId))
		.limit(1);

	if (result.length === 0) {
		return json({ error: 'Resort not found' }, { status: 404 });
	}

	return json(result[0]);
};