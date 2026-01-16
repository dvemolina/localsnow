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

	try {
		// Get schools with resort information
		let schoolsQuery = db
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
			.where(eq(schools.isPublished, true));

		// Apply filters
		if (verifiedOnly) {
			schoolsQuery = schoolsQuery.where(
				and(eq(schools.isPublished, true), eq(schools.isVerified, true))
			);
		}

		if (resortIdParam) {
			const resortId = Number(resortIdParam);
			schoolsQuery = schoolsQuery.where(
				and(eq(schools.isPublished, true), eq(schoolResorts.resortId, resortId))
			);
		}

		let schoolsData = await schoolsQuery;

		// Sort schools
		if (sortBy === 'name_asc') {
			schoolsData.sort((a, b) => a.name.localeCompare(b.name));
		} else if (sortBy === 'name_desc') {
			schoolsData.sort((a, b) => b.name.localeCompare(a.name));
		}

		// Get Spain country ID for resort search
		const [spainCountry] = await db
			.select({ id: countries.id })
			.from(countries)
			.where(eq(countries.country, 'Spain'))
			.limit(1);

		return {
			schools: schoolsData,
			spainCountryId: spainCountry?.id || null,
			filters: {
				resort: resortIdParam,
				verifiedOnly: verifiedOnly ? 'true' : null,
				sortBy: sortBy
			}
		};
	} catch (error) {
		console.error('Error loading schools:', error);
		return {
			schools: [],
			spainCountryId: null,
			filters: {
				resort: resortIdParam,
				verifiedOnly: verifiedOnly ? 'true' : null,
				sortBy: sortBy
			}
		};
	}
};
