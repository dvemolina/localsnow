import { schoolSignupSchema } from "$src/features/Schools/lib/validations/schoolSchemas";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { StorageService } from "$src/lib/server/R2Storage";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit";
import { getClientIP, requireAuth } from "$src/lib/utils/auth";
import { redirect, type Actions } from "@sveltejs/kit";

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
        console.log('Server Hit!');
        const user = requireAuth(event, 'Session Expired. Login again to proceed')
        const form = await superValidate(event.request, zod(schoolSignupSchema));
        console.log('Received Form: ', form)

        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            console.log('Too many requests from same IP')
            return fail(429, {
                message: "Too many requests"
            });
        }
        
        if (!form.valid) {
            console.log('Invalid form: ', form)
            return fail(400, { form })
        }

        console.log('Sent Form: ', form)
        let schoolLogoUrl: string | null = null;

        try {
            
            //Process logo
            if (form.data.logo && form.data.logo.size > 0){
                //Convert file Browser API to Buffer
                const imageArrayBuffer = await form.data.logo.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);
                
                schoolLogoUrl = await storageService.uploadSchoolLogo(imageBuffer, form.data.name, user.id);
                console.log('Profile image uploaded:', schoolLogoUrl);
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

        const schoolData = {
            ...form.data,
            schoolLogoUrl
        }

        console.log('Processed instructor data:', schoolData);

        // TODO: Save to database

        return {form }
    }
};