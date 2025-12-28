import { requireAuth } from "$src/lib/utils/auth.js";
import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { SchoolInstructorService } from "$src/features/Schools/lib/schoolInstructorService.js";
import { db } from "$src/lib/server/db/index.js";
import { schools, users } from "$src/lib/server/db/schema.js";
import { eq } from "drizzle-orm";

const schoolInstructorService = new SchoolInstructorService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access dashboard');

    if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
        redirect(302, '/dashboard');
    }

    // Get pending invitations (schools that invited the instructor)
    const invitations = await schoolInstructorService.getPendingInvitations(user.id);

    // Get pending applications (schools where instructor applied)
    const applications = await schoolInstructorService.getPendingApplications(user.id);

    return {
        invitations,
        applications
    };
};

export const actions: Actions = {
    acceptInvitation: async (event) => {
        const user = requireAuth(event, 'Login to accept');

        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Not authorized' });
        }

        const formData = await event.request.formData();
        const schoolId = parseInt(formData.get('schoolId') as string);

        if (!schoolId) {
            return fail(400, { message: 'School ID required' });
        }

        try {
            // Get school details
            const school = await db
                .select()
                .from(schools)
                .where(eq(schools.id, schoolId))
                .limit(1);

            if (!school[0]) {
                return fail(404, { message: 'School not found' });
            }

            // Get school owner/admin email
            const schoolAdmin = await db
                .select({ email: users.email })
                .from(users)
                .where(eq(users.id, school[0].ownerUserId))
                .limit(1);

            const schoolAdminEmail = schoolAdmin[0]?.email || '';

            await schoolInstructorService.acceptInvitation(
                user.id,
                `${user.name} ${user.lastName}`,
                schoolId,
                school[0].name,
                schoolAdminEmail
            );

            return { success: true, message: 'Invitation accepted' };
        } catch (error: any) {
            console.error('Error accepting invitation:', error);
            return fail(500, { message: error.message || 'Failed to accept invitation' });
        }
    },

    rejectInvitation: async (event) => {
        const user = requireAuth(event, 'Login to reject');

        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Not authorized' });
        }

        const formData = await event.request.formData();
        const schoolId = parseInt(formData.get('schoolId') as string);

        if (!schoolId) {
            return fail(400, { message: 'School ID required' });
        }

        try {
            // Get school details
            const school = await db
                .select()
                .from(schools)
                .where(eq(schools.id, schoolId))
                .limit(1);

            if (!school[0]) {
                return fail(404, { message: 'School not found' });
            }

            // Get school owner/admin email
            const schoolAdmin = await db
                .select({ email: users.email })
                .from(users)
                .where(eq(users.id, school[0].ownerUserId))
                .limit(1);

            const schoolAdminEmail = schoolAdmin[0]?.email || '';

            await schoolInstructorService.rejectInvitation(
                user.id,
                `${user.name} ${user.lastName}`,
                schoolId,
                school[0].name,
                schoolAdminEmail
            );

            return { success: true, message: 'Invitation rejected' };
        } catch (error: any) {
            console.error('Error rejecting invitation:', error);
            return fail(500, { message: error.message || 'Failed to reject invitation' });
        }
    }
};
