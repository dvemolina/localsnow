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

    // Check if any filters are active (prompt-first UX)
    const hasFilters = !!(resortId || sportId || searchQuery || language || priceMin || priceMax || instructorType || verifiedOnly || schoolId || sortBy);

    try {
        // Parse and validate numeric parameters
        const resortIdNum = resortId ? Number(resortId) : undefined;
        const sportIdNum = sportId ? Number(sportId) : undefined;
        const schoolIdNum = schoolId ? Number(schoolId) : undefined;

        // Validate that numeric IDs are valid numbers (not NaN)
        const validResortId = resortIdNum && !isNaN(resortIdNum) ? resortIdNum : undefined;
        const validSportId = sportIdNum && !isNaN(sportIdNum) ? sportIdNum : undefined;
        const validSchoolId = schoolIdNum && !isNaN(schoolIdNum) ? schoolIdNum : undefined;

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

        return {
            instructors: instructorsWithLessons,
            hasFilters,
            spainCountryId: 1, // Spain country ID for resort filter
            filters: {
                resort: resortId,
                sport: sportId,
                query: searchQuery,
                language: language,
                priceMin: priceMin,
                priceMax: priceMax,
                instructorType: instructorType,
                verifiedOnly: verifiedOnly ? 'true' : null,
                school: schoolId,
                sortBy: sortBy
            }
        };
    } catch (error) {
        console.error('Error loading instructors:', error);
        return {
            instructors: [],
            hasFilters,
            spainCountryId: 1,
            filters: {
                resort: resortId,
                sport: sportId,
                query: searchQuery,
                language: language,
                priceMin: priceMin,
                priceMax: priceMax,
                instructorType: instructorType,
                verifiedOnly: verifiedOnly ? 'true' : null,
                school: schoolId,
                sortBy: sortBy
            }
        };
    }
};
