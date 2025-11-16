import type { PageServerLoad } from './$types';
import { db } from '$src/lib/server/db/index';
import { resorts, countries, regions } from '$src/lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Get Spain's country ID
	const spainCountry = await db
		.select({ id: countries.id })
		.from(countries)
		.where(sql`UPPER(${countries.countryCode}) = 'ES'`)
		.limit(1);

	if (!spainCountry[0]) {
		// No Spain data yet, return empty
		return {
			resortsByCountry: [],
			totalResorts: 0,
			seo: {
				title: 'Ski Resorts in Spain | Find Instructors',
				description: 'Browse ski resorts in Spain and find professional ski and snowboard instructors.',
				canonicalUrl: 'https://localsnow.com/resorts'
			}
		};
	}

	// Get only Spanish resorts
	const allResorts = await db
		.select({
			resortId: resorts.id,
			resortName: resorts.name,
			resortSlug: resorts.slug,
			minElevation: resorts.minElevation,
			maxElevation: resorts.maxElevation,
			countryId: countries.id,
			countryName: countries.country,
			countrySlug: countries.countrySlug,
			regionId: regions.id,
			regionName: regions.region,
			regionSlug: regions.regionSlug
		})
		.from(resorts)
		.innerJoin(countries, eq(resorts.countryId, countries.id))
		.leftJoin(regions, eq(resorts.regionId, regions.id))
		.where(eq(countries.id, spainCountry[0].id))
		.orderBy(regions.region, resorts.name);

	// Group by region (since all are in Spain)
	const groupedResorts = allResorts.reduce((acc, resort) => {
		const regionKey = resort.regionSlug || 'other';
		if (!acc[regionKey]) {
			acc[regionKey] = {
				region: resort.regionName || 'Other',
				regionSlug: resort.regionSlug || 'other',
				resorts: []
			};
		}
		acc[regionKey].resorts.push({
			id: resort.resortId,
			name: resort.resortName,
			slug: resort.resortSlug,
			minElevation: resort.minElevation,
			maxElevation: resort.maxElevation,
			regionSlug: resort.regionSlug || resort.countrySlug,
			regionName: resort.regionName
		});
		return acc;
	}, {} as Record<string, any>);

	const resortsByRegion = Object.values(groupedResorts);

	return {
		resortsByCountry: resortsByRegion, // Keep same variable name for compatibility
		totalResorts: allResorts.length,
		countryName: 'Spain',
		seo: {
			title: 'Ski Resorts in Spain | Find Instructors',
			description: `Browse ${allResorts.length} ski resorts in Spain. Find professional ski and snowboard instructors at your favorite Spanish resort.`,
			canonicalUrl: 'https://localsnow.com/resorts'
		}
	};
};
