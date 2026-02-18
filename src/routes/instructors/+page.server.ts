// src/routes/instructors/+page.server.ts
import type { PageServerLoad } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { LessonService } from '$src/features/Lessons/lib/lessonService';
import { ReviewService } from '$src/features/Reviews/lib/reviewService';
import { db } from '$lib/server/db';
import { resorts } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

const lessonService = new LessonService();
const instructorService = new InstructorService();
const reviewService = new ReviewService();

const resolveResortId = async (resortParam: string | null): Promise<number | undefined> => {
	if (!resortParam) {
		return undefined;
	}

	const resortIdNum = Number(resortParam);
	if (Number.isInteger(resortIdNum) && resortIdNum > 0) {
		return resortIdNum;
	}

	const resortSlug = resortParam.trim();
	if (!resortSlug) {
		return undefined;
	}

	const [resort] = await db
		.select({ id: resorts.id })
		.from(resorts)
		.where(eq(resorts.slug, resortSlug))
		.limit(1);

	return resort?.id;
};

export const load: PageServerLoad = async ({ url }) => {
	const resortIdParam = url.searchParams.get('resort');
	const sportId = url.searchParams.get('sport');
	const searchQuery = url.searchParams.get('q');
	const language = url.searchParams.get('language');
	const priceMin = url.searchParams.get('priceMin');
	const priceMax = url.searchParams.get('priceMax');
	const instructorType = url.searchParams.get('instructorType') as
		| 'instructor-independent'
		| 'instructor-school'
		| null;
	const verifiedOnly = url.searchParams.get('verifiedOnly') === 'true';
	const schoolId = url.searchParams.get('school');
	const sortBy = url.searchParams.get('sortBy');

	// Check if any filters are active (prompt-first UX)
	const hasFilters = !!(
		resortIdParam ||
		sportId ||
		searchQuery ||
		language ||
		priceMin ||
		priceMax ||
		instructorType ||
		verifiedOnly ||
		schoolId ||
		sortBy
	);

	try {
		// Parse and validate numeric parameters
		const validResortId = await resolveResortId(resortIdParam);
		const schoolIdNum = schoolId ? Number(schoolId) : undefined;

		// Validate that numeric IDs are valid numbers (not NaN)
		const validSchoolId = schoolIdNum && !isNaN(schoolIdNum) ? schoolIdNum : undefined;
		// Sport is a string ('ski', 'snowboard', etc.), not a number
		const validSportId = sportId || undefined;
		const hasInvalidResortFilter = !!(resortIdParam && validResortId === undefined);

		// If no filters applied, return empty array (prompt-first UX like Yelp/Airbnb)
		// User should search first before seeing results
		let instructors = [];

		// Avoid broad fallback results when a resort filter is present but not resolvable.
		if (hasFilters && !hasInvalidResortFilter) {
			// Search instructors worldwide (no country restrictions)
			instructors = await instructorService.searchInstructors({
				resortId: validResortId,
				sportId: validSportId,
				searchQuery: searchQuery || undefined,
				language: language || undefined,
				instructorType: instructorType || undefined,
				verifiedOnly: verifiedOnly || undefined,
				schoolId: validSchoolId,
				sortBy: sortBy || undefined
			});
		}

		// Fetch base lessons and review stats for all instructors
		let instructorsWithLessons = await Promise.all(
			instructors.map(async (instructor) => {
				try {
					const [lessons, reviewStats] = await Promise.all([
						lessonService.listLessonsByInstructor(instructor.id),
						reviewService.getInstructorStats(instructor.id)
					]);
					const baseLesson = lessons.find((l) => l.isBaseLesson) || null;
					return {
						...instructor,
						baseLesson,
						reviewStats
					};
				} catch (error) {
					console.error(`Error fetching data for instructor ${instructor.id}:`, error);
					return {
						...instructor,
						baseLesson: null,
						reviewStats: null
					};
				}
			})
		);

		// Filter by price range if specified
		if (priceMin || priceMax) {
			instructorsWithLessons = instructorsWithLessons.filter((instructor) => {
				if (!instructor.baseLesson || !instructor.baseLesson.basePrice) return false;
				const price = instructor.baseLesson.basePrice;
				if (priceMin && price < Number(priceMin)) return false;
				if (priceMax && price > Number(priceMax)) return false;
				return true;
			});
		}

		// Sort instructors if sortBy is specified
		if (sortBy) {
			if (sortBy === 'price_asc') {
				instructorsWithLessons.sort((a, b) => {
					const priceA = a.baseLesson?.basePrice || Infinity;
					const priceB = b.baseLesson?.basePrice || Infinity;
					return priceA - priceB;
				});
			} else if (sortBy === 'price_desc') {
				instructorsWithLessons.sort((a, b) => {
					const priceA = a.baseLesson?.basePrice || 0;
					const priceB = b.baseLesson?.basePrice || 0;
					return priceB - priceA;
				});
			}
			// name_asc and name_desc are already handled in repository
		}

		const resortIds = Array.from(
			new Set(
				instructorsWithLessons
					.flatMap((instructor) => instructor.resorts || [])
					.filter((resortId) => typeof resortId === 'number')
			)
		);

		const resortNameRows =
			resortIds.length > 0
				? await db
						.select({ id: resorts.id, name: resorts.name })
						.from(resorts)
						.where(inArray(resorts.id, resortIds))
				: [];

		const resortNameMap = new Map(resortNameRows.map((row) => [row.id, row.name]));

		const instructorsWithResorts = instructorsWithLessons.map((instructor) => {
			const resortObjects = (instructor.resorts || [])
				.map((resortId) => {
					if (typeof resortId !== 'number') return resortId;
					const name = resortNameMap.get(resortId);
					return name ? { id: resortId, name } : resortId;
				})
				.filter(Boolean);
			return {
				...instructor,
				resorts: resortObjects
			};
		});

		const result = {
			instructors: instructorsWithResorts,
			hasFilters,
			filters: {
				resort: validResortId || undefined, // Pass parsed number, not string
				sport: sportId || undefined, // Pass as string
				query: searchQuery,
				language: language,
				priceMin: priceMin ? Number(priceMin) : undefined,
				priceMax: priceMax ? Number(priceMax) : undefined,
				instructorType: instructorType,
				verifiedOnly: verifiedOnly ? 'true' : null,
				school: validSchoolId || undefined, // Pass parsed number, not string
				sortBy: sortBy
			}
		};

		return result;
	} catch (error) {
		console.error('Error loading instructors:', error);
		const fallbackResortId = resortIdParam ? Number(resortIdParam) : undefined;
		const validSchoolId = schoolId ? Number(schoolId) : undefined;
		return {
			instructors: [],
			hasFilters,
			filters: {
				resort: fallbackResortId && !isNaN(fallbackResortId) ? fallbackResortId : undefined,
				sport: sportId || undefined,
				query: searchQuery,
				language: language,
				priceMin: priceMin ? Number(priceMin) : undefined,
				priceMax: priceMax ? Number(priceMax) : undefined,
				instructorType: instructorType,
				verifiedOnly: verifiedOnly ? 'true' : null,
				school: validSchoolId && !isNaN(validSchoolId) ? validSchoolId : undefined,
				sortBy: sortBy
			}
		};
	}
};
