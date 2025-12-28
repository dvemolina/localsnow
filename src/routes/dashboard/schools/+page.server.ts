import { requireAuth } from "$src/lib/utils/auth.js";
import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { db } from "$src/lib/server/db/index.js";
import { schools, schoolResorts, instructorResorts, schoolInstructors, schoolAdmins, users } from "$src/lib/server/db/schema.js";
import { eq, and, inArray, notInArray } from "drizzle-orm";
import { SchoolInstructorService } from "$src/features/Schools/lib/schoolInstructorService.js";

const schoolInstructorService = new SchoolInstructorService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access dashboard');

    if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
        redirect(302, '/dashboard');
    }

    // Get instructor's resorts
    const instructorResortsData = await db
        .select({ resortId: instructorResorts.resortId })
        .from(instructorResorts)
        .where(eq(instructorResorts.instructorId, user.id));

    const resortIds = instructorResortsData.map(r => r.resortId);

    if (resortIds.length === 0) {
        return { schools: [] };
    }

    // Get schools the instructor is already associated with (pending, accepted, or rejected)
    const existingAssociations = await db
        .select({ schoolId: schoolInstructors.schoolId })
        .from(schoolInstructors)
        .where(eq(schoolInstructors.instructorId, user.id));

    const excludedSchoolIds = existingAssociations.map(a => a.schoolId);

    // Get all verified schools at instructor's resorts
    let availableSchools;

    if (excludedSchoolIds.length > 0) {
        availableSchools = await db
            .select({
                id: schools.id,
                name: schools.name,
                slug: schools.slug,
                bio: schools.bio,
                logo: schools.logo,
                isVerified: schools.isVerified,
                schoolEmail: schools.schoolEmail,
                schoolPhone: schools.schoolPhone
            })
            .from(schools)
            .innerJoin(schoolResorts, eq(schools.id, schoolResorts.schoolId))
            .where(
                and(
                    eq(schools.isVerified, true),
                    eq(schools.isPublished, true),
                    inArray(schoolResorts.resortId, resortIds),
                    notInArray(schools.id, excludedSchoolIds)
                )
            );
    } else {
        availableSchools = await db
            .select({
                id: schools.id,
                name: schools.name,
                slug: schools.slug,
                bio: schools.bio,
                logo: schools.logo,
                isVerified: schools.isVerified,
                schoolEmail: schools.schoolEmail,
                schoolPhone: schools.schoolPhone
            })
            .from(schools)
            .innerJoin(schoolResorts, eq(schools.id, schoolResorts.schoolId))
            .where(
                and(
                    eq(schools.isVerified, true),
                    eq(schools.isPublished, true),
                    inArray(schoolResorts.resortId, resortIds)
                )
            );
    }

    return { schools: availableSchools };
};

export const actions: Actions = {
    apply: async (event) => {
        const user = requireAuth(event, 'Login to apply');

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

            await schoolInstructorService.applyToSchool(
                user.id,
                `${user.name} ${user.lastName}`,
                user.email,
                schoolId,
                school[0].name,
                schoolAdminEmail
            );

            return { success: true, message: 'Application sent successfully' };
        } catch (error: any) {
            console.error('Error applying to school:', error);
            return fail(500, { message: error.message || 'Failed to send application' });
        }
    }
};
