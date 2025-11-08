// src/routes/[countrySlug]/[regionSlug]/[resortSlug]/[sportSlug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ResortsService } from '$src/features/Resorts/lib/ResortsService';
import { SportsService } from '$src/features/Sports/lib/sportsService';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { LessonService } from '$src/features/Lessons/lib/lessonService';
import { db } from '$lib/server/db';
import { countries, regions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const resortsService = new ResortsService();
const sportsService = new SportsService();
const instructorService = new InstructorService();
const lessonService = new LessonService();

export const load: PageServerLoad = async ({ params }) => {
	const { countrySlug, regionSlug, resortSlug, sportSlug } = params;

	try {
		// Fetch country
		const countryResult = await db
			.select()
			.from(countries)
			.where(eq(countries.countrySlug, countrySlug))
			.limit(1);

		if (countryResult.length === 0) {
			throw error(404, `Country not found: ${countrySlug}`);
		}
		const country = countryResult[0];

		// Fetch region
		const regionResult = await db
			.select()
			.from(regions)
			.where(eq(regions.regionSlug, regionSlug))
			.limit(1);

		if (regionResult.length === 0) {
			throw error(404, `Region not found: ${regionSlug}`);
		}
		const region = regionResult[0];

		// Verify region belongs to country
		if (region.countryId !== country.id) {
			throw error(404, `Region ${regionSlug} does not belong to country ${countrySlug}`);
		}

		// Fetch resort
		const resort = await resortsService.getResortBySlug(resortSlug);
		if (!resort) {
			throw error(404, `Resort not found: ${resortSlug}`);
		}

		// Verify resort belongs to region
		if (resort.regionId !== region.id) {
			throw error(404, `Resort ${resortSlug} does not belong to region ${regionSlug}`);
		}

		// Fetch sport
		const sport = await sportsService.getSportBySlug(sportSlug);
		if (!sport) {
			throw error(404, `Sport not found: ${sportSlug}`);
		}

		// Fetch instructors at this resort who teach this sport
		const instructors = await instructorService.searchInstructors({
			resortId: resort.id,
			sportId: sport.id
		});

		// Fetch base lessons for all instructors
		const instructorsWithLessons = await Promise.all(
			instructors.map(async (instructor) => {
				try {
					const lessons = await lessonService.listLessonsByInstructor(instructor.id);
					const baseLesson = lessons.find((l) => l.isBaseLesson) || null;
					return {
						...instructor,
						baseLesson
					};
				} catch (error) {
					console.error(`Error fetching lessons for instructor ${instructor.id}:`, error);
					return {
						...instructor,
						baseLesson: null
					};
				}
			})
		);

		// Calculate price range for instructors at this resort/sport
		const prices = instructorsWithLessons
			.map((i) => i.baseLesson?.basePrice)
			.filter((p): p is number => p !== null && p !== undefined);

		const priceRange =
			prices.length > 0
				? {
						min: Math.min(...prices),
						max: Math.max(...prices),
						currency: instructorsWithLessons[0]?.baseLesson?.currency || 'EUR'
					}
				: null;

		return {
			country,
			region,
			resort,
			sport,
			instructors: instructorsWithLessons,
			priceRange,
			// SEO metadata
			meta: {
				title: `${sport.sport} Instructors in ${resort.name}, ${region.region} | Local Snow`,
				description: `Find certified ${sport.sport.toLowerCase()} instructors in ${resort.name}, ${region.region}. Book directly with professional instructors - no booking fees. ${instructorsWithLessons.length} instructors available.`,
				keywords: `${sport.sport.toLowerCase()} instructor ${resort.name}, clases de ${sport.sport.toLowerCase()} ${resort.name}, profesor de ${sport.sport.toLowerCase()} ${region.region}, ${sport.sport.toLowerCase()} lessons ${resort.name}`
			}
		};
	} catch (err) {
		console.error('Error loading resort page:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load resort page');
	}
};
