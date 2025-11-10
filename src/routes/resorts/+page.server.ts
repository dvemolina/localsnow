import type { PageServerLoad } from './$types';
import { db } from '$src/lib/server/db/index';
import { resorts, countries, regions } from '$src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Get all resorts grouped by country
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
		.orderBy(countries.country, regions.region, resorts.name);

	// Group by country
	const groupedResorts = allResorts.reduce((acc, resort) => {
		const countryKey = resort.countrySlug;
		if (!acc[countryKey]) {
			acc[countryKey] = {
				country: resort.countryName,
				countrySlug: resort.countrySlug,
				resorts: []
			};
		}
		acc[countryKey].resorts.push({
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

	const resortsByCountry = Object.values(groupedResorts);

	return {
		resortsByCountry,
		totalResorts: allResorts.length,
		seo: {
			title: 'Ski Resorts Directory | Find Instructors Worldwide',
			description: `Browse ${allResorts.length} ski resorts worldwide. Find professional ski and snowboard instructors at your favorite resort.`,
			canonicalUrl: 'https://localsnow.com/resorts'
		}
	};
};
