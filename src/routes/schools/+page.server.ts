import type { PageServerLoad } from './$types';
import { SchoolService } from '$src/features/Schools/lib/schoolService';
import { db } from '$lib/server/db';
import { schools, schoolResorts, resorts, regions, countries } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const schoolService = new SchoolService();

export const load: PageServerLoad = async ({ url }) => {
	const resortIdParam = url.searchParams.get('resort');
	const verifiedOnly = url.searchParams.get('verifiedOnly') === 'true';
	const sortBy = url.searchParams.get('sortBy');

	// Check if any filters are active (prompt-first UX)
	const hasFilters = !!(resortIdParam || verifiedOnly || sortBy);

	try {
		// If no filters applied, return empty array (prompt-first UX like Yelp/Airbnb)
		let schoolsData = [];

		if (hasFilters) {
			// Build WHERE conditions array for proper filtering
			const conditions: any[] = [eq(schools.isPublished, true)];

			// Add verified filter if requested
			if (verifiedOnly) {
				conditions.push(eq(schools.isVerified, true));
			}

			// Add resort filter if provided
			if (resortIdParam) {
				const resortId = Number(resortIdParam);
				if (!isNaN(resortId)) {
					conditions.push(eq(schoolResorts.resortId, resortId));
				}
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

		// Parse resort ID to number for client form
		const parsedResortId = resortIdParam ? Number(resortIdParam) : undefined;
		const validResortId = parsedResortId && !isNaN(parsedResortId) ? parsedResortId : undefined;

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
		const parsedResortId = resortIdParam ? Number(resortIdParam) : undefined;
		const validResortId = parsedResortId && !isNaN(parsedResortId) ? parsedResortId : undefined;
		return {
			schools: [],
			hasFilters,
			filters: {
				resort: validResortId,
				verifiedOnly: verifiedOnly ? 'true' : null,
				sortBy: sortBy
			}
		};
	}
};
