
import { db } from '$src/lib/server/db';
import { countries, regions, resorts } from '$src/lib/server/db/schema';
import { and, eq, ilike } from 'drizzle-orm';

const SPAIN_COUNTRY_ID = 55; // Spain's countryId in the database

export class ResortRepository {
	async searchByName(query: string, limit = 10) {
		if (!query || query.length < 2) return [];

		return await db
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
			.where(
				and(
					ilike(resorts.name, `%${query}%`),
					eq(resorts.countryId, SPAIN_COUNTRY_ID)
				)
			)
			.limit(limit);
	}
}