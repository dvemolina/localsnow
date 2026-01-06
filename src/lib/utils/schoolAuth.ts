import { redirect, type RequestEvent } from "@sveltejs/kit";
import { requireAuth } from "./auth";
import { SchoolService } from "$src/features/Schools/lib/schoolService";

const schoolService = new SchoolService();

export async function requireSchoolAdmin(event: RequestEvent) {
	// First ensure user is authenticated
	const user = requireAuth(event);

	// Check if user is a school admin
	if (user.role !== 'school-admin') {
		throw redirect(302, '/dashboard');
	}

	// Fetch the school owned by this user
	const school = await schoolService.getSchoolByOwner(user.id);

	if (!school) {
		throw redirect(302, '/dashboard?error=' + encodeURIComponent('No school found for this account'));
	}

	return { user, school };
}
