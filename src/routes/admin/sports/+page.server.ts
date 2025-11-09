// src/routes/admin/sports/+page.server.ts
import { db } from '$lib/server/db';
import { sports, instructorSports, users } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allSports = await db.query.sports.findMany({
		orderBy: (sports, { asc }) => [asc(sports.sport)]
	});

	// Get instructor count for each sport
	const sportsWithCounts = await Promise.all(
		allSports.map(async (sport) => {
			const instructorCount = await db
				.select({ count: count() })
				.from(instructorSports)
				.where(eq(instructorSports.sportId, sport.id));

			return {
				...sport,
				instructorCount: instructorCount[0]?.count || 0
			};
		})
	);

	return { sports: sportsWithCounts };
};
