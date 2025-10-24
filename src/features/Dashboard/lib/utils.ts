// src/lib/server/profileVisits.ts
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

		return (result.rows[0] as any)?.visit_count || 0;
	} catch (error) {
		console.error('Error getting monthly visits:', error);
		return 0;
	}
}