import type { PageServerLoad } from './$types';
import { db } from '$src/lib/server/db/index';
import { resorts, countries, regions, users, instructorResorts } from '$src/lib/server/db/schema';
import { eq, sql, isNull, or, and, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Show ALL resorts worldwide that have at least 1 active instructor
	const resortsWithInstructors = await db
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
			regionSlug: regions.regionSlug,
			// Count active instructors for this resort
			instructorCount: sql<number>`cast(count(distinct ${users.id}) as integer)`
		})
		.from(resorts)
		.innerJoin(countries, eq(resorts.countryId, countries.id))
		.leftJoin(regions, eq(resorts.regionId, regions.id))
		.leftJoin(instructorResorts, eq(resorts.id, instructorResorts.resortId))
		.leftJoin(
			users,
			and(
				eq(instructorResorts.instructorId, users.id),
				isNull(users.deletedAt),
				or(eq(users.role, 'instructor-independent'), eq(users.role, 'instructor-school'))
			)
		)
		.groupBy(
			resorts.id,
			resorts.name,
			resorts.slug,
			resorts.minElevation,
			resorts.maxElevation,
			countries.id,
			countries.country,
			countries.countrySlug,
			regions.id,
			regions.region,
			regions.regionSlug
		)
		.having(sql`count(distinct ${users.id}) > 0`)
		.orderBy(desc(sql`count(distinct ${users.id})`), resorts.name);

	// Group resorts by country
	const resortsByCountry = resortsWithInstructors.reduce(
		(acc, resort) => {
			const countryKey = resort.countrySlug || 'other';
			if (!acc[countryKey]) {
				acc[countryKey] = {
					country: resort.countryName || 'Other',
					countrySlug: resort.countrySlug || 'other',
					regions: {} as Record<string, any>
				};
			}

			const regionKey = resort.regionSlug || 'other';
			if (!acc[countryKey].regions[regionKey]) {
				acc[countryKey].regions[regionKey] = {
					region: resort.regionName || 'Other',
					regionSlug: resort.regionSlug || 'other',
					resorts: []
				};
			}

			acc[countryKey].regions[regionKey].resorts.push({
				id: resort.resortId,
				name: resort.resortName,
				slug: resort.resortSlug,
				minElevation: resort.minElevation,
				maxElevation: resort.maxElevation,
				instructorCount: resort.instructorCount
			});

			return acc;
		},
		{} as Record<string, any>
	);

	// Convert to array and sort by instructor count
	const countriesArray = Object.values(resortsByCountry).map((country: any) => ({
		...country,
		regions: Object.values(country.regions),
		totalInstructors: Object.values(country.regions).reduce(
			(sum: number, region: any) =>
				sum + region.resorts.reduce((s: number, r: any) => s + r.instructorCount, 0),
			0
		)
	}));

	// Sort countries by total instructor count
	countriesArray.sort((a, b) => b.totalInstructors - a.totalInstructors);

	return {
		resortsByCountry: countriesArray,
		totalResorts: resortsWithInstructors.length,
		seo: {
			title: 'Ski Resorts Worldwide | Find Instructors at Top Ski Resorts',
			description: `Browse ${resortsWithInstructors.length} ski resorts worldwide. Find professional ski and snowboard instructors at top resorts around the world.`,
			canonicalUrl: 'https://localsnow.com/resorts'
		}
	};
};
