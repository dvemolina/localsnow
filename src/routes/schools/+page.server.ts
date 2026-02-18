import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { schools, schoolResorts, resorts, regions, countries } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const resolveResortId = async (resortParam: string | null): Promise<number | undefined> => {
	if (!resortParam) {
		return undefined;
	}

	const resortIdNum = Number(resortParam);
	if (Number.isInteger(resortIdNum) && resortIdNum > 0) {
		return resortIdNum;
	}

	const resortSlug = resortParam.trim();
	if (!resortSlug) {
		return undefined;
	}

	const [resort] = await db
		.select({ id: resorts.id })
		.from(resorts)
		.where(eq(resorts.slug, resortSlug))
		.limit(1);

	return resort?.id;
};

export const load: PageServerLoad = async ({ url }) => {
	const resortIdParam = url.searchParams.get('resort');
	const verifiedOnly = url.searchParams.get('verifiedOnly') === 'true';
	const sortBy = url.searchParams.get('sortBy');

	// Check if any filters are active (prompt-first UX)
	const hasFilters = !!(resortIdParam || verifiedOnly || sortBy);

	try {
		const validResortId = await resolveResortId(resortIdParam);
		const hasInvalidResortFilter = !!(resortIdParam && validResortId === undefined);

		// If no filters applied, return empty array (prompt-first UX like Yelp/Airbnb)
		let schoolsData = [];

		// Avoid broad fallback results when a resort filter is present but not resolvable.
		if (hasFilters && !hasInvalidResortFilter) {
			// Build WHERE conditions array for proper filtering
			const conditions = [eq(schools.isPublished, true)];

			// Add verified filter if requested
			if (verifiedOnly) {
				conditions.push(eq(schools.isVerified, true));
			}

			// Add resort filter if provided
			if (validResortId) {
				conditions.push(eq(schoolResorts.resortId, validResortId));
			}

			// Execute query with all conditions applied at once
			schoolsData = await db
				.select({
					id: schools.id,
					uuid: schools.uuid,
					ownerUserId: schools.ownerUserId,
					name: schools.name,
					slug: schools.slug,
					bio: schools.bio,
					schoolEmail: schools.schoolEmail,
					countryCode: schools.countryCode,
					schoolPhone: schools.schoolPhone,
					logo: schools.logo,
					isPublished: schools.isPublished,
					isVerified: schools.isVerified,
					resortId: schoolResorts.resortId,
					resortName: resorts.name,
					resortSlug: resorts.slug,
					regionName: regions.region,
					countryName: countries.country
				})
				.from(schools)
				.innerJoin(schoolResorts, eq(schools.id, schoolResorts.schoolId))
				.innerJoin(resorts, eq(schoolResorts.resortId, resorts.id))
				.leftJoin(regions, eq(resorts.regionId, regions.id))
				.innerJoin(countries, eq(resorts.countryId, countries.id))
				.where(and(...conditions));

			// Sort schools
			if (sortBy === 'name_asc') {
				schoolsData.sort((a, b) => a.name.localeCompare(b.name));
			} else if (sortBy === 'name_desc') {
				schoolsData.sort((a, b) => b.name.localeCompare(a.name));
			}
		}

		return {
			schools: schoolsData,
			hasFilters,
			filters: {
				resort: validResortId, // Pass parsed number, not string
				verifiedOnly: verifiedOnly ? 'true' : null,
				sortBy: sortBy
			}
		};
	} catch (error) {
		console.error('Error loading schools:', error);
		const fallbackResortId = resortIdParam ? Number(resortIdParam) : undefined;
		return {
			schools: [],
			hasFilters,
			filters: {
				resort: fallbackResortId && !isNaN(fallbackResortId) ? fallbackResortId : undefined,
				verifiedOnly: verifiedOnly ? 'true' : null,
				sortBy: sortBy
			}
		};
	}
};
