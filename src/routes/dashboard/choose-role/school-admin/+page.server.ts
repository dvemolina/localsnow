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

const schoolService = new SchoolService()
const storageService = new StorageService();
const ipBucket = new RefillingTokenBucket<string>(3, 10);

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to choose a Role for your account');
    if (user.role) redirect(302, '/dashboard')
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
        
        //To improve set a Flash Message System (sveltekit-flash-messages library maybe?)
        redirect(302, '/dashboard')
    }
};