// src/routes/instructors/+page.server.ts
import type { PageServerLoad } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { LessonService } from '$src/features/Lessons/lib/lessonService';
import { SportsService } from '$src/features/Sports/lib/sportsService';
import { ResortsService } from '$src/features/Resorts/lib/ResortsService';

const lessonService = new LessonService();
const instructorService = new InstructorService();
const sportsService = new SportsService();
const resortsService = new ResortsService();

export const load: PageServerLoad = async ({ url }) => {
    // Parse filter parameters (using slugs for SEO-friendly URLs)
    const sportSlug = url.searchParams.get('sport');
    const resortSlug = url.searchParams.get('resort');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const groupSize = url.searchParams.get('groupSize');

    try {
        // Fetch sports and resorts for filter dropdowns
        const [allSports, allResorts] = await Promise.all([
            sportsService.getAllSports(),
            resortsService.getAllResorts()
        ]);

        // Convert slugs to IDs for backend filtering
        let sportId: number | undefined;
        let resortId: number | undefined;

        if (sportSlug) {
            const sport = allSports.find(s => s.sportSlug === sportSlug);
            sportId = sport?.id;
        }

        if (resortSlug) {
            const resort = allResorts.find(r => r.slug === resortSlug);
            resortId = resort?.id;
        }

        // Search instructors with filters
        const instructors = await instructorService.searchInstructors({
            resortId,
            sportId,
            minPrice: minPrice ? parseInt(minPrice) : undefined,
            maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
            groupSize: groupSize ? parseInt(groupSize) : undefined
            // Note: Date filtering will be added to availability check
        });

        // Fetch base lessons for all instructors
        const instructorsWithLessons = await Promise.all(
            instructors.map(async (instructor) => {
                try {
                    const lessons = await lessonService.listLessonsByInstructor(instructor.id);
                    const baseLesson = lessons.find(l => l.isBaseLesson) || null;
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

        // TODO: Filter by availability dates if startDate/endDate provided
        // This requires checking working hours + calendar blocks for each instructor
        // Will be implemented in next iteration

        return {
            instructors: instructorsWithLessons,
            sports: allSports.map(s => ({ id: s.id, name: s.sport, slug: s.sportSlug })),
            resorts: allResorts.map(r => ({ id: r.id, name: r.name, slug: r.slug })),
            filters: {
                sport: sportSlug,
                resort: resortSlug,
                minPrice,
                maxPrice,
                startDate,
                endDate,
                groupSize
            }
        };
    } catch (error) {
        console.error('Error loading instructors:', error);
        return {
            instructors: [],
            sports: [],
            resorts: [],
            filters: {
                sport: sportSlug,
                resort: resortSlug,
                minPrice,
                maxPrice,
                startDate,
                endDate,
                groupSize
            }
        };
    }
};