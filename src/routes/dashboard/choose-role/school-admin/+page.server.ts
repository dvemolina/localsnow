import { schoolSignupSchema } from "$src/features/Schools/lib/validations/schoolSchemas";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { StorageService } from "$src/lib/server/R2Storage";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit";
import { getClientIP, requireAuth } from "$src/lib/utils/auth";
import { redirect, type Actions } from "@sveltejs/kit";
import { SchoolService } from "$src/features/Schools/lib/schoolService";
import { slugifyString } from "$src/lib/utils/generics";
import { getRoles } from "$src/lib/utils/roles";

const schoolService = new SchoolService()
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

    const form = await superValidate(zod(schoolSignupSchema));

    return { form }
};

export const actions: Actions = {
    default: async (event) => {
        const user = requireAuth(event, 'Session Expired. Login again to proceed')
        const form = await superValidate(event.request, zod(schoolSignupSchema));

        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests"
            });
        }
        
        if (!form.valid) {
            return fail(400, { form })
        }

        let logoUrl: string | null = null;

        try {
            
            //Process logo
            if (form.data.logo && form.data.logo.size > 0){
                //Convert file Browser API to Buffer

                const imageArrayBuffer = await form.data.logo.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);
                
                logoUrl = await storageService.uploadSchoolLogo(imageBuffer, form.data.name, user.id);
            }

        } catch (error) {
            console.error('Error processing form files:', error);
            return fail(500, {
                form,
                message: 'Failed to process files. Please try again.'
            });
        }

        // Remove the File logo since we now have a URL
        delete form.data.logo;

        const ownerUserId = user.id
        const slug = slugifyString(form.data.name)

        const schoolSignupData = {
            ...form.data,
            ownerUserId,
            logoUrl,
            slug
        }

        await schoolService.createSchool(schoolSignupData);

        const locale = getLocaleFromPath(event.url.pathname);
        //To improve set a Flash Message System (sveltekit-flash-messages library maybe?)
        throw redirect(303, `/${locale}/dashboard`);
    }
};
