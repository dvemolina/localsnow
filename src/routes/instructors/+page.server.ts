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

    try {
        // Search instructors worldwide (no country restrictions)
        const instructors = await instructorService.searchInstructors({
            resortId: resortId ? Number(resortId) : undefined,
            sportId: sportId ? Number(sportId) : undefined,
            searchQuery: searchQuery || undefined,
            language: language || undefined,
            instructorType: instructorType || undefined,
            verifiedOnly: verifiedOnly || undefined,
            schoolId: schoolId ? Number(schoolId) : undefined,
            sortBy: sortBy || undefined
        });

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
