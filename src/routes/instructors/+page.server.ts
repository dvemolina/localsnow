// src/routes/instructors/+page.server.ts
import type { PageServerLoad } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { LessonService } from '$src/features/Lessons/lib/lessonService';

const lessonService = new LessonService();
const instructorService = new InstructorService();

export const load: PageServerLoad = async ({ url }) => {
    const resortId = url.searchParams.get('resort');
    const sportId = url.searchParams.get('sport');
    const searchQuery = url.searchParams.get('q');
    const language = url.searchParams.get('language');

    try {
        const instructors = await instructorService.searchInstructors({
            resortId: resortId ? Number(resortId) : undefined,
            sportId: sportId ? Number(sportId) : undefined,
            searchQuery: searchQuery || undefined,
            language: language || undefined
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

        return {
            instructors: instructorsWithLessons,
            filters: {
                resort: resortId,
                sport: sportId,
                query: searchQuery,
                language: language
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
                language: language
            }
        };
    }
};