
import { db } from '$src/lib/server/db';
import { countries, regions, resorts } from '$src/lib/server/db/schema';
import { eq, ilike } from 'drizzle-orm';

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
			.where(ilike(resorts.name, `%${query}%`))
			.limit(limit);
	}

	async getAllResorts() {
		return await db
			.select({
				id: resorts.id,
				name: resorts.name,
				slug: resorts.slug,
				label: resorts.label,
				minElevation: resorts.minElevation,
				maxElevation: resorts.maxElevation,
				lat: resorts.lat,
				lon: resorts.lon,
				website: resorts.website,
				countryId: resorts.countryId,
				regionId: resorts.regionId
			})
			.from(resorts);
	}

	async getResortBySlug(slug: string) {
		const result = await db
			.select({
				id: resorts.id,
				name: resorts.name,
				slug: resorts.slug,
				label: resorts.label,
				minElevation: resorts.minElevation,
				maxElevation: resorts.maxElevation,
				lat: resorts.lat,
				lon: resorts.lon,
				website: resorts.website,
				countryId: resorts.countryId,
				regionId: resorts.regionId
			})
			.from(resorts)
			.where(eq(resorts.slug, slug))
			.limit(1);

		return result[0] || null;
	}

	async getResortById(id: number) {
		const result = await db
			.select({
				id: resorts.id,
				name: resorts.name,
				slug: resorts.slug,
				label: resorts.label,
				minElevation: resorts.minElevation,
				maxElevation: resorts.maxElevation,
				lat: resorts.lat,
				lon: resorts.lon,
				website: resorts.website,
				countryId: resorts.countryId,
				regionId: resorts.regionId
			})
			.from(resorts)
			.where(eq(resorts.id, id))
			.limit(1);

		return result[0] || null;
	}
}