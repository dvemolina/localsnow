import { db } from '$lib/server/db';
import { resorts, countries, regions } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const allCountries = await db.query.countries.findMany({
		orderBy: (countries, { asc }) => [asc(countries.country)]
	});

	const allRegions = await db.query.regions.findMany({
		with: {
			country: true
		},
		orderBy: (regions, { asc }) => [asc(regions.region)]
	});

	return {
		countries: allCountries,
		regions: allRegions
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const label = formData.get('label') as string;
		const countryId = formData.get('countryId') as string;
		const regionId = formData.get('regionId') as string;
		const minElevation = formData.get('minElevation') as string;
		const maxElevation = formData.get('maxElevation') as string;
		const lat = formData.get('lat') as string;
		const lon = formData.get('lon') as string;
		const website = formData.get('website') as string;

		// Validation
		if (!name || !slug || !countryId) {
			return fail(400, { error: 'Name, slug, and country are required' });
		}

		// Check if slug already exists
		const existing = await db.query.resorts.findFirst({
			where: (resorts, { eq }) => eq(resorts.slug, slug)
		});

		if (existing) {
			return fail(400, { error: 'Slug already exists' });
		}

		try {
			const [newResort] = await db
				.insert(resorts)
				.values({
					name,
					slug,
					label: label || null,
					countryId: parseInt(countryId),
					regionId: regionId ? parseInt(regionId) : null,
					minElevation: minElevation ? parseInt(minElevation) : null,
					maxElevation: maxElevation ? parseInt(maxElevation) : null,
					lat: lat || null,
					lon: lon || null,
					website: website || null
				})
				.returning();

			console.log('Resort created successfully:', newResort.id);
		} catch (error) {
			console.error('Error creating resort:', error);
			return fail(500, { error: 'Failed to create resort' });
		}

		// Redirect OUTSIDE try-catch
		redirect(303, '/admin/resorts');
	}
};
