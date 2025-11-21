import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { redirect, type Actions } from "@sveltejs/kit";
import { getClientIP, requireAuth } from "$src/lib/utils/auth";

import { RefillingTokenBucket } from "$src/lib/server/rate-limit";
import { instructorSignupSchema, type InstructorSignupData } from "$src/features/Instructors/lib/instructorSchemas";
import { StorageService } from "$src/lib/server/R2Storage";
import { InstructorService } from "$src/features/Instructors/lib/instructorService";

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

    if (user.role) {
        redirect(302, `/${locale}/dashboard`);
    }

    const form = await superValidate(zod(instructorSignupSchema));

    return { form }
};

export const actions: Actions = {
    default: async (event)=> {
        const user = requireAuth(event, 'Session Expired. Login again to proceed')
        const form = await superValidate(event.request, zod(instructorSignupSchema));

        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests"
            });
        }
        
        if (!form.valid) {
            return fail(400, { form })
        }

        console.log('Sent Form: ', form)
        let qualificationUrl: string | null = null;
        let profileImageUrl: string | null = null;

        try {
            
            //Process profile image
            if (form.data.profileImage && form.data.profileImage.size > 0){
                //Convert file Browser API to Buffer
                const imageArrayBuffer = await form.data.profileImage.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);
                
                profileImageUrl = await storageService.uploadProfileImage(imageBuffer, user.id);
            }

            // Process qualification PDF
            if (form.data.qualification && form.data.qualification.size > 0) {
                // Convert File to Buffer
                const pdfArrayBuffer = await form.data.qualification.arrayBuffer();
                const pdfBuffer = Buffer.from(pdfArrayBuffer);
                
                qualificationUrl = await storageService.uploadQualificationPDF(pdfBuffer, user.id);
            }
        } catch (error) {
            console.error('Error processing form files:', error);
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


        await instructorService.createInstructor(instructorSignupData);

        const locale = getLocaleFromPath(event.url.pathname);
        //To improve set a Flash Message System (sveltekit-flash-messages library maybe?)
        throw redirect(303, `/${locale}/dashboard`);
    }
};