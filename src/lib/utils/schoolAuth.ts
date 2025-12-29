import { error, type RequestEvent } from "@sveltejs/kit";
import { requireAuth } from "./auth";
import { SchoolRepository } from "$src/features/Schools/lib/schoolRepository";
import { db } from "$lib/server/db/index";
import { schoolAdmins, schools, type School } from "$src/lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { User } from "$src/lib/server/db/schema";

/**
 * Require user to be a school admin and return both user and school
 */
export async function requireSchoolAdmin(event: RequestEvent): Promise<{ user: User; school: School }> {
	const user = requireAuth(event, 'Login required to access school dashboard');

	if (user.role !== 'school-admin') {
		error(403, 'Access denied. School admin privileges required.');
	}

	// Get school for this admin
	const school = await getSchoolForAdmin(user.id);

	if (!school) {
		error(404, 'No school found for this admin. Please contact support.');
	}

	return { user, school };
}

/**
 * Get school where user is an admin (owner or additional admin)
 */
export async function getSchoolForAdmin(userId: number): Promise<School | null> {
	const result = await db
		.select({ school: schools })
		.from(schoolAdmins)
		.innerJoin(schools, eq(schoolAdmins.schoolId, schools.id))
		.where(
			and(
				eq(schoolAdmins.userId, userId),
				eq(schoolAdmins.isAccepted, true)
			)
		)
		.limit(1);

	return result[0]?.school ?? null;
}

/**
 * Check if user is owner of a specific school
 */
export async function isSchoolOwner(userId: number, schoolId: number): Promise<boolean> {
	const result = await db
		.select({ isOwner: schoolAdmins.isOwner })
		.from(schoolAdmins)
		.where(
			and(
				eq(schoolAdmins.userId, userId),
				eq(schoolAdmins.schoolId, schoolId),
				eq(schoolAdmins.isAccepted, true)
			)
		);

	return result[0]?.isOwner ?? false;
}

/**
 * Check if user has admin access to a specific school
 */
export async function hasSchoolAdminAccess(userId: number, schoolId: number): Promise<boolean> {
	const result = await db
		.select({ schoolId: schoolAdmins.schoolId })
		.from(schoolAdmins)
		.where(
			and(
				eq(schoolAdmins.userId, userId),
				eq(schoolAdmins.schoolId, schoolId),
				eq(schoolAdmins.isAccepted, true)
			)
		);

	return result.length > 0;
}

/**
 * Require user to have admin access to a specific school
 * Useful for API endpoints that work with specific schools
 */
export async function requireSchoolAdminAccess(
	event: RequestEvent,
	schoolId: number
): Promise<{ user: User; school: School; isOwner: boolean }> {
	const user = requireAuth(event, 'Login required');

	if (user.role !== 'school-admin') {
		error(403, 'School admin privileges required');
	}

	const hasAccess = await hasSchoolAdminAccess(user.id, schoolId);
	if (!hasAccess) {
		error(403, 'You do not have access to this school');
	}

	const schoolRepository = new SchoolRepository();
	const school = await schoolRepository.getSchoolById(schoolId);

	if (!school) {
		error(404, 'School not found');
	}

	const isOwner = await isSchoolOwner(user.id, schoolId);

	return { user, school, isOwner };
}
