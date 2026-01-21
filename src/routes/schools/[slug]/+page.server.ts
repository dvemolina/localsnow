import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SchoolService } from '$src/features/Schools/lib/schoolService';
import { db } from '$lib/server/db';
import { schools, schoolResorts, resorts, regions, countries, schoolInstructors, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const schoolService = new SchoolService();

export const load: PageServerLoad = async (event) => {
	const { slug } = event.params;

	if (!slug) {
		throw error(404, 'School not found');
	}

	try {
		// Get school by slug
		const school = await schoolService.getSchoolBySlug(slug);

		if (!school) {
			throw error(404, 'School not found');
		}

		// Check if profile is published (only admins or the owner can view unpublished)
		const isOwner = event.locals.user?.id === school.ownerUserId;
		const isAdmin = event.locals.user?.role === 'admin';
		if (!school.isPublished && !isOwner && !isAdmin) {
			throw error(404, 'School not found');
		}

		// Get school resorts with full details
		const schoolResortsData = await db
			.select({
				id: resorts.id,
				name: resorts.name,
				slug: resorts.slug,
				regionName: regions.region,
				countryName: countries.country
			})
			.from(schoolResorts)
			.innerJoin(resorts, eq(schoolResorts.resortId, resorts.id))
			.leftJoin(regions, eq(resorts.regionId, regions.id))
			.innerJoin(countries, eq(resorts.countryId, countries.id))
			.where(eq(schoolResorts.schoolId, school.id));

		// Get school instructors (only accepted instructors)
		const schoolInstructorsData = await db
			.select({
				id: users.id,
				name: users.name,
				lastName: users.lastName,
				profileImageUrl: users.profileImageUrl,
				bio: users.bio,
				isVerified: users.isVerified,
				isPublished: users.isPublished
			})
			.from(schoolInstructors)
			.innerJoin(users, eq(schoolInstructors.instructorId, users.id))
			.where(
				and(
					eq(schoolInstructors.schoolId, school.id),
					eq(schoolInstructors.isAcceptedBySchool, true),
					eq(users.isPublished, true) // Only show published instructors
				)
			);

		return {
			school,
			resorts: schoolResortsData,
			instructors: schoolInstructorsData,
			user: event.locals.user
		};
	} catch (err) {
		console.error('Error loading school profile:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load school profile');
	}
};
