// src/routes/admin/resorts/+page.server.ts
import { db } from '$lib/server/db';
import { resorts, countries, regions } from '$lib/server/db/schema';
import { eq, ilike, and, or, sql, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const countryId = url.searchParams.get('country') || undefined;
	const regionId = url.searchParams.get('region') || undefined;
	const search = url.searchParams.get('search') || undefined;
	const perPage = 50;

	// Build where conditions
	const conditions = [];

	if (countryId) {
		conditions.push(eq(resorts.countryId, parseInt(countryId)));
	}

	if (regionId) {
		conditions.push(eq(resorts.regionId, parseInt(regionId)));
	}

	if (search) {
		conditions.push(
			or(
				ilike(resorts.name, `%${search}%`),
				ilike(resorts.slug, `%${search}%`)
			)
		);
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Get total count for pagination
	const [{ value: totalCount }] = await db
		.select({ value: count() })
		.from(resorts)
		.where(whereClause);

	const totalPages = Math.ceil(totalCount / perPage);
	const offset = (page - 1) * perPage;

	// Get paginated resorts
	const resortsList = await db.query.resorts.findMany({
		where: whereClause,
		with: {
			country: true,
			region: true
		},
		orderBy: (resorts, { asc }) => [asc(resorts.name)],
		limit: perPage,
		offset
	});

	// Get all countries and regions for filters
	const allCountries = await db.query.countries.findMany({
		orderBy: (countries, { asc }) => [asc(countries.country)]
	});

	const allRegions = await db.query.regions.findMany({
		where: countryId ? eq(regions.countryId, parseInt(countryId)) : undefined,
		with: {
			country: true
		},
		orderBy: (regions, { asc }) => [asc(regions.region)]
	});

	return {
		resorts: resortsList,
		countries: allCountries,
		regions: allRegions,
		pagination: {
			page,
			totalPages,
			totalCount,
			perPage
		},
		filters: {
			country: countryId,
			region: regionId,
			search
		}
	};
};
