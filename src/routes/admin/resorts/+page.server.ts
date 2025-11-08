// src/routes/admin/resorts/+page.server.ts
import { db } from '$lib/server/db';
import { resorts } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allResorts = await db.query.resorts.findMany({
		with: {
			country: true,
			region: true
		},
		orderBy: (resorts, { asc }) => [asc(resorts.name)]
	});

	return { resorts: allResorts };
};
