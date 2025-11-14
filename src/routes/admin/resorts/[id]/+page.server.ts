import { db } from '$lib/server/db';
import { resorts } from '$lib/server/db/schema';
import { StorageService } from '$lib/server/R2Storage';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
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
		throw error(404, 'Resort not found');
	}

	return { resort };
};

export const actions: Actions = {
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
	}
};
