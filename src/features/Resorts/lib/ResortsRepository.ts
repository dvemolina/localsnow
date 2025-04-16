
import { db } from '$src/lib/server/db';
import { countries, regions, resorts } from '$src/lib/server/db/schema';
import { eq, ilike } from 'drizzle-orm';

export class ResortRepository {
	async searchByName(query: string, limit = 10) {
		if (!query || query.length < 2) return [];

		return await db
			.select({
				name: resorts.name,
				slug: resorts.slug,
				region: regions.region,
				country: countries.country
			})
			.from(resorts)
			.innerJoin(regions, eq(resorts.regionId, regions.id))
			.innerJoin(countries, eq(resorts.countryId, countries.id))
			.where(ilike(resorts.name, `%${query}%`))
			.limit(limit);
	}
}