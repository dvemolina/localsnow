// src/routes/instructors/+page.server.ts
import type { PageServerLoad } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { LessonService } from '$src/features/Lessons/lib/lessonService';
import { ReviewService } from '$src/features/Reviews/lib/reviewService';

const lessonService = new LessonService();
const instructorService = new InstructorService();
const reviewService = new ReviewService();

export const load: PageServerLoad = async ({ url }) => {
    const resortId = url.searchParams.get('resort');
    const sportId = url.searchParams.get('sport');
    const searchQuery = url.searchParams.get('q');
    const language = url.searchParams.get('language');
    const priceMin = url.searchParams.get('priceMin');
    const priceMax = url.searchParams.get('priceMax');
    const instructorType = url.searchParams.get('instructorType') as 'instructor-independent' | 'instructor-school' | null;
    const verifiedOnly = url.searchParams.get('verifiedOnly') === 'true';
    const schoolId = url.searchParams.get('school');
    const sortBy = url.searchParams.get('sortBy');

    console.log('🔍 [Instructors Page Load] URL params:', { resortId, sportId, searchQuery });

    // Check if any filters are active (prompt-first UX)
    const hasFilters = !!(resortId || sportId || searchQuery || language || priceMin || priceMax || instructorType || verifiedOnly || schoolId || sortBy);

    try {
        // Parse and validate numeric parameters
        const resortIdNum = resortId ? Number(resortId) : undefined;
        const schoolIdNum = schoolId ? Number(schoolId) : undefined;

        // Validate that numeric IDs are valid numbers (not NaN)
        const validResortId = resortIdNum && !isNaN(resortIdNum) ? resortIdNum : undefined;
        const validSchoolId = schoolIdNum && !isNaN(schoolIdNum) ? schoolIdNum : undefined;
        // Sport is a string ('ski', 'snowboard', etc.), not a number
        const validSportId = sportId || undefined;

        // If no filters applied, return empty array (prompt-first UX like Yelp/Airbnb)
        // User should search first before seeing results
        let instructors = [];

        if (hasFilters) {
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
                    const baseLesson = lessons.find(l => l.isBaseLesson) || null;
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
            instructorsWithLessons = instructorsWithLessons.filter(instructor => {
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

        const result = {
            instructors: instructorsWithLessons,
            hasFilters,
            spainCountryId: 1, // Spain country ID for resort filter
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

        console.log('✅ [Instructors Page] Returning to client:', {
            hasFilters: result.hasFilters,
            filters: result.filters,
            instructorCount: result.instructors.length
        });

        return result;
    } catch (error) {
        console.error('Error loading instructors:', error);
        const validResortId = resortId ? Number(resortId) : undefined;
        const validSchoolId = schoolId ? Number(schoolId) : undefined;
        return {
            instructors: [],
            hasFilters,
            spainCountryId: 1,
            filters: {
                resort: validResortId && !isNaN(validResortId) ? validResortId : undefined,
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
