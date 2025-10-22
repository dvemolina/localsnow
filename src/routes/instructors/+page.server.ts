// src/routes/instructors/+page.server.ts
import type { PageServerLoad } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';

const instructorService = new InstructorService();

export const load: PageServerLoad = async ({ url }) => {
    // Get filter parameters from URL
    const resortId = url.searchParams.get('resort');
    const sportId = url.searchParams.get('sport');
    const searchQuery = url.searchParams.get('q');

    try {
        const instructors = await instructorService.searchInstructors({
            resortId: resortId ? Number(resortId) : undefined,
            sportId: sportId ? Number(sportId) : undefined,
            searchQuery: searchQuery || undefined
        });

        return {
            instructors,
            filters: {
                resort: resortId,
                sport: sportId,
                query: searchQuery
            }
        };
    } catch (error) {
        console.error('Error loading instructors:', error);
        return {
            instructors: [],
            filters: {
                resort: resortId,
                sport: sportId,
                query: searchQuery
            }
        };
    }
};