// src/features/Dashboard/lib/utils.ts
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export async function trackProfileVisit(instructorId: number, visitorIP: string) {
	try {
		const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

		// Insert visit record
		await db.execute(sql`
			INSERT INTO profile_visits (instructor_id, visitor_ip, year_month)
			VALUES (${instructorId}, ${visitorIP}, ${currentYearMonth})
		`);

		return true;
	} catch (error) {
		console.error('Error tracking profile visit:', error);
		return false;
	}
}

export async function getMonthlyVisits(instructorId: number): Promise<number> {
	try {
		const currentYearMonth = new Date().toISOString().slice(0, 7);
		
		const result = await db.execute(sql`
			SELECT COUNT(DISTINCT visitor_ip) as visit_count
			FROM profile_visits
			WHERE instructor_id = ${instructorId}
			AND year_month = ${currentYearMonth}
		`);

		// Handle different possible result formats from different database drivers
		// Some return result.rows[0], others return result[0]
		let visitCount = 0;
		
		if (result && Array.isArray(result)) {
			// Direct array result
			visitCount = result[0]?.visit_count ?? 0;
		} else if (result?.rows && Array.isArray(result.rows)) {
			// Result with rows property
			visitCount = result.rows[0]?.visit_count ?? 0;
		}
		
		return Number(visitCount) || 0;
	} catch (error) {
		console.error('Error getting monthly visits:', error);
		return 0;
	}
}