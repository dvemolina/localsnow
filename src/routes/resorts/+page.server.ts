import type { PageServerLoad } from './$types';
import { db } from '$src/lib/server/db/index';
import { resorts, countries, regions, users, instructorResorts, userRoles } from '$src/lib/server/db/schema';
import { eq, sql, isNull, and, desc, inArray } from 'drizzle-orm';
import { extractLocale, type Locale } from '$lib/i18n/routes';
import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

const PRIMARY_ORIGIN = 'https://localsnow.org';

export const load: PageServerLoad = async ({ url }) => {
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
			userRoles,
			and(
				eq(instructorResorts.instructorId, userRoles.userId),
				inArray(userRoles.role, ['instructor-independent', 'instructor-school'])
			)
		)
		.leftJoin(
			users,
			and(
				eq(userRoles.userId, users.id),
				isNull(users.deletedAt)
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

	// Group resorts by region (flattened structure for compatibility with existing UI)
	// Format: Array of regions, each containing resorts from that region
	const resortsByRegion = resortsWithInstructors.reduce(
		(acc, resort) => {
			// Create a unique key combining country and region for worldwide support
			const regionKey = `${resort.countrySlug || 'other'}-${resort.regionSlug || 'other'}`;

			if (!acc[regionKey]) {
				acc[regionKey] = {
					region: resort.regionName
						? `${resort.regionName}, ${resort.countryName}`
						: resort.countryName || 'Other',
					regionSlug: resort.regionSlug || 'other',
					countrySlug: resort.countrySlug || 'other',
					countryName: resort.countryName || 'Other',
					resorts: []
				};
			}

			acc[regionKey].resorts.push({
				id: resort.resortId,
				name: resort.resortName,
				slug: resort.resortSlug,
				minElevation: resort.minElevation,
				maxElevation: resort.maxElevation,
				regionName: resort.regionName,
				regionSlug: resort.regionSlug,
				instructorCount: resort.instructorCount
			});

			return acc;
		},
		{} as Record<string, any>
	);

	// Convert to array and sort by total instructors in each region
	const regionsArray = Object.values(resortsByRegion).map((region: any) => ({
		...region,
		totalInstructors: region.resorts.reduce((sum: number, r: any) => sum + r.instructorCount, 0)
	}));

	// Sort regions by total instructor count (highest first)
	regionsArray.sort((a, b) => b.totalInstructors - a.totalInstructors);

	const { locale } = extractLocale(url.pathname);
	const currentLocale = (locale || 'en') as Locale;
	const canonicalPath = route('/resorts', currentLocale);
	const canonicalUrl = `${PRIMARY_ORIGIN}${canonicalPath}`;
	const alternates = getAlternateUrls(canonicalPath).map((alt) => ({
		locale: alt.locale,
		url: `${PRIMARY_ORIGIN}${alt.url}`
	}));

	return {
		resortsByCountry: regionsArray, // Keep variable name for compatibility
		totalResorts: resortsWithInstructors.length,
		seo: {
			title: 'Ski Resorts Worldwide | Find Instructors at Top Ski Resorts',
			description: `Browse ${resortsWithInstructors.length} ski resorts worldwide. Find professional ski and snowboard instructors at top resorts around the world.`,
			canonicalUrl,
			alternates
		}
	};
};
