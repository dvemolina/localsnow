import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { redirect, type Actions } from "@sveltejs/kit";
import { getClientIP, requireAuth } from "$src/lib/utils/auth";

import { RefillingTokenBucket } from "$src/lib/server/rate-limit";
import { instructorSignupSchema, type InstructorSignupData } from "$src/features/Instructors/lib/instructorSchemas";
import { StorageService } from "$src/lib/server/R2Storage";
import { InstructorService } from "$src/features/Instructors/lib/instructorService";
import { validateSessionToken, sessionCookieName } from "$src/lib/server/session";
import { getRoles } from "$src/lib/utils/roles";
import { db } from "$src/lib/server/db";
import { resortRequests } from "$src/lib/server/db/schema";
import { eq, desc } from "drizzle-orm";

const instructorService = new InstructorService();
const storageService = new StorageService();
const ipBucket = new RefillingTokenBucket<string>(3, 10);

// Helper to get locale from URL path
function getLocaleFromPath(pathname: string): string {
    const match = pathname.match(/^\/(en|es)\//);
    return match ? match[1] : 'en';
}

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to choose a Role for your account');
    const locale = getLocaleFromPath(event.url.pathname);

    if (getRoles(user).length > 0) {
        redirect(302, `/${locale}/dashboard`);
    }

    const form = await superValidate(zod(instructorSignupSchema));

    // Check for pending resort requests
    const pendingResortRequests = await db.query.resortRequests.findMany({
        where: eq(resortRequests.requesterId, user.id),
        orderBy: [desc(resortRequests.createdAt)],
        limit: 5
    });

    return { form, pendingResortRequests }
};

export const actions: Actions = {
    default: async (event)=> {
        console.log('[Instructor Signup] Starting form submission');
        const user = requireAuth(event, 'Session Expired. Login again to proceed')

        // For file uploads, explicitly get FormData first
        const formData = await event.request.formData();
        console.log('[Instructor Signup] FormData entries:', Array.from(formData.keys()));

        const form = await superValidate(formData, zod(instructorSignupSchema));

        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            console.log('[Instructor Signup] Rate limit exceeded for IP:', clientIP);
            return fail(429, {
                message: "Too many requests"
            });
        }

        if (!form.valid) {
            console.log('[Instructor Signup] Form validation failed');
            console.log('[Instructor Signup] Errors:', JSON.stringify(form.errors, null, 2));
            console.log('[Instructor Signup] Form data types:', {
                profileImage: form.data.profileImage ? {
                    constructor: form.data.profileImage.constructor.name,
                    size: form.data.profileImage.size,
                    type: form.data.profileImage.type,
                    name: form.data.profileImage.name
                } : 'null/undefined',
                qualification: form.data.qualification ? {
                    constructor: form.data.qualification.constructor.name,
                    size: form.data.qualification.size,
                    type: form.data.qualification.type,
                    name: form.data.qualification.name
                } : 'null/undefined'
            });
            return fail(400, { form })
        }

        console.log('[Instructor Signup] Form validated. User ID:', user.id);
        console.log('[Instructor Signup] Profile image size:', form.data.profileImage?.size || 0, 'bytes');
        console.log('[Instructor Signup] Qualification size:', form.data.qualification?.size || 0, 'bytes');

        let qualificationUrl: string | null = null;
        let profileImageUrl: string | null = null;

        try {

            //Process profile image
            if (form.data.profileImage && form.data.profileImage.size > 0){
                console.log('[Instructor Signup] Starting profile image upload');
                //Convert file Browser API to Buffer
                const imageArrayBuffer = await form.data.profileImage.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);

                profileImageUrl = await storageService.uploadProfileImage(imageBuffer, user.id);
                console.log('[Instructor Signup] Profile image uploaded:', profileImageUrl);
            }

            // Process qualification PDF
            if (form.data.qualification && form.data.qualification.size > 0) {
                console.log('[Instructor Signup] Starting qualification PDF upload');
                // Convert File to Buffer
                const pdfArrayBuffer = await form.data.qualification.arrayBuffer();
                const pdfBuffer = Buffer.from(pdfArrayBuffer);

                qualificationUrl = await storageService.uploadQualificationPDF(pdfBuffer, user.id);
                console.log('[Instructor Signup] Qualification PDF uploaded:', qualificationUrl);
            }
        } catch (error) {
            console.error('[Instructor Signup] Error processing form files:', error);
            return fail(500, {
                form,
                message: 'Failed to process files. Please try again.'
            });
        }

        // Remove the File objects since we now have URLs
        delete form.data.profileImage;
        delete form.data.qualification;

        const userId = user.id

        //Instructor data with URLS
        const instructorSignupData: InstructorSignupData = {
            ...form.data,
            profileImageUrl,
            qualificationUrl,
            userId
        };

        console.log('[Instructor Signup] Creating instructor profile in database');
        try {
            await instructorService.createInstructor(instructorSignupData);
            console.log('[Instructor Signup] Instructor profile created successfully');
        } catch (error) {
            console.error('[Instructor Signup] Error creating instructor:', error);
            return fail(500, {
                form,
                message: 'Failed to create instructor profile. Please try again.'
            });
        }

        // Refresh session to get updated user data with the newly assigned role
        // This ensures the sidebar appears immediately on the dashboard without page reload
        console.log('[Instructor Signup] Refreshing session with updated user data');
        const sessionToken = event.cookies.get(sessionCookieName);
        if (sessionToken) {
            const { user: updatedUser } = await validateSessionToken(sessionToken);
            if (updatedUser) {
                event.locals.user = updatedUser;
                console.log('[Instructor Signup] Session refreshed, user role:', updatedUser.role);
            }
        }

        const locale = getLocaleFromPath(event.url.pathname);
        console.log('[Instructor Signup] Redirecting to dashboard');
        //To improve set a Flash Message System (sveltekit-flash-messages library maybe?)
        throw redirect(303, `/${locale}/dashboard`);
    }
};
