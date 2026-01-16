import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';

const instructorService = new InstructorService();

export const POST: RequestHandler = async (event) => {
    // Check authentication
    const user = event.locals.user;
    if (!user) {
        throw error(401, 'Unauthorized');
    }

    const instructorId = parseInt(event.params.id);
    if (isNaN(instructorId)) {
        throw error(400, 'Invalid instructor ID');
    }

    // Check authorization - only the instructor themselves or admin can publish/unpublish
    if (user.id !== instructorId && user.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    // Verify user is an instructor
    if (!user.role?.includes('instructor') && user.role !== 'admin') {
        throw error(403, 'Only instructors can publish profiles');
    }

    try {
        const body = await event.request.json();
        const { isPublished } = body;

        if (typeof isPublished !== 'boolean') {
            throw error(400, 'isPublished must be a boolean');
        }

        // Update publish status
        const updatedUser = await instructorService.updateInstructorPublishStatus(instructorId, isPublished);

        if (!updatedUser) {
            throw error(404, 'Instructor not found');
        }

        return json({
            success: true,
            isPublished: updatedUser.isPublished
        });
    } catch (err) {
        console.error('Error updating publish status:', err);
        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }
        throw error(500, 'Failed to update publish status');
    }
};
