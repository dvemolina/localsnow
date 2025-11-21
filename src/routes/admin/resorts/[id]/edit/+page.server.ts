import { db } from '$lib/server/db';
import { resorts, countries, regions } from '$lib/server/db/schema';
import { StorageService } from '$lib/server/R2Storage';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const resort = await db.query.resorts.findFirst({
		where: eq(resorts.id, parseInt(params.id)),
		with: {
			country: true,
			region: true
		}
	});

	if (!resort) {
		error(404, 'Resort not found');
	}

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
		resort,
		countries: allCountries,
		regions: allRegions
	};
};

export const actions: Actions = {
	updateDetails: async ({ request, params }) => {
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

		// Check if slug exists for another resort
		const existing = await db.query.resorts.findFirst({
			where: (resorts, { eq, and, ne }) =>
				and(eq(resorts.slug, slug), ne(resorts.id, parseInt(params.id)))
		});

		if (existing) {
			return fail(400, { error: 'Slug already exists for another resort' });
		}

		let updateError = false;

		try {
			await db
				.update(resorts)
				.set({
					name,
					slug,
					label: label || null,
					countryId: parseInt(countryId),
					regionId: regionId ? parseInt(regionId) : null,
					minElevation: minElevation ? parseInt(minElevation) : null,
					maxElevation: maxElevation ? parseInt(maxElevation) : null,
					lat: lat || null,
					lon: lon || null,
					website: website || null,
					updatedAt: new Date()
				})
				.where(eq(resorts.id, parseInt(params.id)));
		} catch (err) {
			console.error('Error updating resort:', err);
			updateError = true;
		}

		if (updateError) {
			return fail(500, { error: 'Failed to update resort' });
		}

		return { success: true, message: 'Resort updated successfully' };
	},

	uploadImage: async ({ request, params }) => {
		const formData = await request.formData();
		const imageFile = formData.get('image') as File;

		if (!imageFile || imageFile.size === 0) {
			return fail(400, { error: 'Image file is required' });
		}

		// Validate file type
		if (!imageFile.type.startsWith('image/')) {
			return fail(400, { error: 'File must be an image' });
		}

		// Validate file size (max 10MB)
		if (imageFile.size > 10 * 1024 * 1024) {
			return fail(400, { error: 'Image must be less than 10MB' });
		}

		try {
			// Get resort details
			const resort = await db.query.resorts.findFirst({
				where: eq(resorts.id, parseInt(params.id))
			});

			if (!resort) {
				return fail(404, { error: 'Resort not found' });
			}

			// Convert file to buffer
			const arrayBuffer = await imageFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Upload to R2
			const storageService = new StorageService();
			const imageUrl = await storageService.uploadResortImage(buffer, resort.slug);

			// Update database
			await db
				.update(resorts)
				.set({ image: imageUrl, updatedAt: new Date() })
				.where(eq(resorts.id, parseInt(params.id)));

			return { success: true, imageUrl };
		} catch (err) {
			console.error('Error uploading resort image:', err);
			return fail(500, { error: 'Failed to upload resort image' });
		}
	},

	delete: async ({ params, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		let deleteError = false;

		try {
			await db.delete(resorts).where(eq(resorts.id, parseInt(params.id)));
		} catch (err) {
			console.error('Error deleting resort:', err);
			deleteError = true;
		}

		if (deleteError) {
			return fail(500, { error: 'Failed to delete resort' });
		}

		// Redirect OUTSIDE try-catch
		redirect(303, '/admin/resorts');
	}
};
