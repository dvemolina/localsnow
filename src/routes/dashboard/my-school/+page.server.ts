// src/routes/dashboard/my-school/+page.server.ts
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireDashboardRole } from '$src/lib/utils/dashboardAuth';
import { db } from '$src/lib/server/db';
import {
    schools,
    schoolInstructors,
} from '$src/lib/server/db/schema';
import { eq, and, isNull, ilike } from 'drizzle-orm';
import { SchoolInstructorService } from '$src/features/Schools/lib/schoolInstructorService';
import { emailService } from '$src/lib/server/email/service';
import { z } from 'zod';

const schoolInstructorService = new SchoolInstructorService();

const ADMIN_EMAIL = 'admin@localsnow.org';

// ─── Load ────────────────────────────────────────────────────────────────────

export const load: PageServerLoad = async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-school'],
        'Login to access school settings'
    );

    const searchQuery = event.url.searchParams.get('q')?.trim() ?? '';

    // Current association (active, pending app, pending invite)
    const [associationRows, invitationRows, schoolList] = await Promise.all([
        // Active school or pending application submitted by instructor
        db.select({
            schoolId: schoolInstructors.schoolId,
            schoolName: schools.name,
            schoolSlug: schools.slug,
            schoolLogo: schools.logo,
            isActive: schoolInstructors.isActive,
            requestedBy: schoolInstructors.requestedBy,
            requestedAt: schoolInstructors.requestedAt
        })
            .from(schoolInstructors)
            .innerJoin(schools, eq(schoolInstructors.schoolId, schools.id))
            .where(and(
                eq(schoolInstructors.instructorId, user.id),
                isNull(schoolInstructors.rejectedAt)
            ))
            .limit(1),

        // Pending invitations FROM schools
        db.select({
            schoolId: schoolInstructors.schoolId,
            schoolName: schools.name,
            schoolSlug: schools.slug,
            schoolLogo: schools.logo,
            requestedAt: schoolInstructors.requestedAt
        })
            .from(schoolInstructors)
            .innerJoin(schools, eq(schoolInstructors.schoolId, schools.id))
            .where(and(
                eq(schoolInstructors.instructorId, user.id),
                eq(schoolInstructors.requestedBy, 'school'),
                eq(schoolInstructors.isActive, false),
                isNull(schoolInstructors.rejectedAt)
            )),

        // School search list (all published, non-suspended)
        db.select({
            id: schools.id,
            name: schools.name,
            slug: schools.slug,
            logo: schools.logo,
            bio: schools.bio,
            isVerified: schools.isVerified,
            schoolEmail: schools.schoolEmail
        })
            .from(schools)
            .where(and(
                eq(schools.isPublished, true),
                eq(schools.isSuspended, false),
                searchQuery ? ilike(schools.name, `%${searchQuery}%`) : undefined
            ))
            .limit(30)
    ]);

    const association = associationRows[0] ?? null;

    return {
        user,
        association,        // current active or pending-application relationship
        invitations: invitationRows,  // invitations from schools
        schoolList,
        searchQuery
    };
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export const actions: Actions = {
    /**
     * Instructor applies to an existing school.
     */
    applyToSchool: async (event) => {
        const user = requireDashboardRole(event, ['instructor-school'], 'Login required');

        const formData = await event.request.formData();
        const schoolId = Number(formData.get('schoolId'));
        const schoolName = String(formData.get('schoolName') ?? '');
        const schoolAdminEmail = String(formData.get('schoolAdminEmail') ?? ADMIN_EMAIL);

        if (!schoolId || !schoolName) {
            return fail(400, { error: 'Invalid school data.' });
        }

        try {
            await schoolInstructorService.applyToSchool(
                user.id,
                `${user.name} ${user.lastName}`,
                user.email,
                schoolId,
                schoolName,
                schoolAdminEmail || ADMIN_EMAIL
            );
            return { success: true, message: `Application sent to ${schoolName}.` };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to apply.';
            return fail(400, { error: msg });
        }
    },

    /**
     * Instructor cancels a pending application they submitted.
     */
    cancelApplication: async (event) => {
        const user = requireDashboardRole(event, ['instructor-school'], 'Login required');

        const formData = await event.request.formData();
        const schoolId = Number(formData.get('schoolId'));

        if (!schoolId) return fail(400, { error: 'Invalid school.' });

        await db.delete(schoolInstructors)
            .where(and(
                eq(schoolInstructors.instructorId, user.id),
                eq(schoolInstructors.schoolId, schoolId),
                eq(schoolInstructors.requestedBy, 'instructor'),
                eq(schoolInstructors.isActive, false)
            ));

        return { success: true, message: 'Application cancelled.' };
    },

    /**
     * Instructor accepts a school invitation.
     */
    acceptInvitation: async (event) => {
        const user = requireDashboardRole(event, ['instructor-school'], 'Login required');

        const formData = await event.request.formData();
        const schoolId = Number(formData.get('schoolId'));
        const schoolName = String(formData.get('schoolName') ?? '');
        const schoolAdminEmail = String(formData.get('schoolAdminEmail') ?? ADMIN_EMAIL);

        if (!schoolId) return fail(400, { error: 'Invalid school.' });

        try {
            await schoolInstructorService.acceptInvitation(
                user.id,
                `${user.name} ${user.lastName}`,
                schoolId,
                schoolName,
                schoolAdminEmail || ADMIN_EMAIL
            );
            return { success: true, message: `You've joined ${schoolName}!` };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to accept invitation.';
            return fail(400, { error: msg });
        }
    },

    /**
     * Instructor rejects a school invitation.
     */
    rejectInvitation: async (event) => {
        const user = requireDashboardRole(event, ['instructor-school'], 'Login required');

        const formData = await event.request.formData();
        const schoolId = Number(formData.get('schoolId'));
        const schoolName = String(formData.get('schoolName') ?? '');
        const schoolAdminEmail = String(formData.get('schoolAdminEmail') ?? ADMIN_EMAIL);

        if (!schoolId) return fail(400, { error: 'Invalid school.' });

        try {
            await schoolInstructorService.rejectInvitation(
                user.id,
                `${user.name} ${user.lastName}`,
                schoolId,
                schoolName,
                schoolAdminEmail || ADMIN_EMAIL
            );
            return { success: true, message: 'Invitation declined.' };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to reject invitation.';
            return fail(400, { error: msg });
        }
    },

    /**
     * Instructor requests registration of a school not yet in the directory.
     * Sends an admin notification — no school is created automatically.
     */
    requestSchoolRegistration: async (event) => {
        const user = requireDashboardRole(event, ['instructor-school'], 'Login required');

        const formData = await event.request.formData();
        const schema = z.object({
            schoolName:  z.string().min(2, 'School name required'),
            schoolEmail: z.string().email('Valid email required'),
            schoolPhone: z.string().min(5, 'Phone required'),
            resortName:  z.string().min(2, 'Resort name required'),
            website:     z.string().url('Enter a valid URL').optional().or(z.literal(''))
        });

        const parsed = schema.safeParse({
            schoolName:  formData.get('schoolName'),
            schoolEmail: formData.get('schoolEmail'),
            schoolPhone: formData.get('schoolPhone'),
            resortName:  formData.get('resortName'),
            website:     formData.get('website') || undefined
        });

        if (!parsed.success) {
            return fail(400, { fieldErrors: parsed.error.flatten().fieldErrors });
        }

        const { schoolName, schoolEmail, schoolPhone, resortName, website } = parsed.data;
        const instructorName = `${user.name} ${user.lastName}`;

        try {
            await emailService.send({
                to: ADMIN_EMAIL,
                subject: `[LocalSnow] School Registration Request — ${schoolName}`,
                html: `
                    <h2>New School Registration Request</h2>
                    <p>An instructor has requested the addition of a new school to the directory.</p>
                    <table style="border-collapse:collapse;width:100%">
                        <tr><td style="padding:4px 8px;font-weight:bold">School name</td><td>${schoolName}</td></tr>
                        <tr><td style="padding:4px 8px;font-weight:bold">School email</td><td>${schoolEmail}</td></tr>
                        <tr><td style="padding:4px 8px;font-weight:bold">School phone</td><td>${schoolPhone}</td></tr>
                        <tr><td style="padding:4px 8px;font-weight:bold">Resort</td><td>${resortName}</td></tr>
                        ${website ? `<tr><td style="padding:4px 8px;font-weight:bold">Website</td><td><a href="${website}">${website}</a></td></tr>` : ''}
                        <tr><td style="padding:4px 8px;font-weight:bold">Requested by</td><td>${instructorName} (ID: ${user.id}, email: ${user.email})</td></tr>
                    </table>
                    <p style="margin-top:16px">
                        <a href="https://localsnow.org/dashboard/admin" style="background:#000;color:#fff;padding:8px 16px;text-decoration:none;border-radius:4px">
                            Open Admin Dashboard
                        </a>
                    </p>
                `,
                sendTelegram: true,
                telegramMessage: `🏫 School registration request\n• School: ${schoolName}\n• Resort: ${resortName}\n• By: ${instructorName} (${user.email})\n• Contact: ${schoolEmail} / ${schoolPhone}`
            });
        } catch (error) {
            console.error('[my-school] Failed to send school registration email:', error);
            // Don't block the instructor — they'll see success either way
        }

        return {
            success: true,
            registrationRequested: true,
            requestedSchoolName: schoolName,
            message: `Your request for "${schoolName}" has been sent. We'll add it to the directory and let you know.`
        };
    }
};
