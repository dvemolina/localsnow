
import { db } from '$src/lib/server/db';
import { countries, regions, resorts } from '$src/lib/server/db/schema';
import { and, eq, ilike, SQL } from 'drizzle-orm';

export class ResortRepository {
	/**
	 * Search resorts by name with optional country filter
	 * @param query - Search query string (minimum 2 characters)
	 * @param limit - Maximum number of results to return (default: 10)
	 * @param countryId - Optional country ID to filter results. If not provided, searches all countries.
	 * @returns Array of matching resorts with region and country information
	 */
	async searchByName(query: string, limit = 10, countryId?: number) {
		console.log('🏔️ [ResortRepository] searchByName called:', { query, limit, countryId });

		if (!query || query.length < 2) {
			console.log('❌ [ResortRepository] Query too short or empty');
			return [];
		}

		// Build where conditions
		const conditions: SQL[] = [ilike(resorts.name, `%${query}%`)];

		// Add country filter only if countryId is provided
		if (countryId !== undefined && countryId !== null) {
			conditions.push(eq(resorts.countryId, countryId));
			console.log('🌍 [ResortRepository] Filtering by countryId:', countryId);
		}

		console.log('🔎 [ResortRepository] Search conditions:', {
			namePattern: `%${query}%`,
			countryFilter: countryId !== undefined ? `countryId = ${countryId}` : 'none'
		});

		const results = await db
			.select({
				id: resorts.id,
				name: resorts.name,
				slug: resorts.slug,
				region: regions.region,
				country: countries.country
			})
			.from(resorts)
			.leftJoin(regions, eq(resorts.regionId, regions.id))
			.innerJoin(countries, eq(resorts.countryId, countries.id))
			.where(and(...conditions))
			.limit(limit);

		console.log('✅ [ResortRepository] Found results:', { count: results.length, resorts: results.map(r => r.name) });

		return results;
	}
}