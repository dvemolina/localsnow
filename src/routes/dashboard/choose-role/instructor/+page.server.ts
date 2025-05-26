import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { redirect, type Actions } from "@sveltejs/kit";
import { getClientIP, requireAuth } from "$src/lib/utils/auth";
import { UserService } from "$src/features/Users/lib/UserService";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit";
import { instructorSignupSchema } from "$src/features/Instructors/lib/instructorSchemas";
import { StorageService } from "$src/lib/server/R2Storage";

const userService = new UserService();
const storageService = new StorageService();
const ipBucket = new RefillingTokenBucket<string>(3, 10);

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to choose a Role for your account');
    if (user.role) redirect(302, '/dashboard')
    const form = await superValidate(zod(instructorSignupSchema));
    
    return { form }
};

export const actions: Actions = {
    default: async (event)=> {
        console.log('Server Hit!');
        const user = requireAuth(event, 'Session Expired. Login again to proceed')
        const form = await superValidate(event.request, zod(instructorSignupSchema));
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
        let qualificationUrl: string | null = null;
        let profileImageUrl: string | null = null;

        try {
            
            //Process profile image
            if (form.data.profileImage && form.data.profileImage.size > 0){
                //Convert file Browser API to Buffer
                const imageArrayBuffer = await form.data.profileImage.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);
                
                profileImageUrl = await storageService.uploadProfileImage(imageBuffer, user.id);
                console.log('Profile image uploaded:', profileImageUrl);
            }

            // Process qualification PDF
            if (form.data.qualification && form.data.qualification.size > 0) {
                // Convert File to Buffer
                const pdfArrayBuffer = await form.data.qualification.arrayBuffer();
                const pdfBuffer = Buffer.from(pdfArrayBuffer);
                
                qualificationUrl = await storageService.uploadQualificationPDF(pdfBuffer, user.id);
                console.log('Qualification PDF uploaded:', qualificationUrl);
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

        //Instructor data with URLS
        const instructorData = {
            ...form.data,
            profileImageUrl,
            qualificationUrl,
            
        };

        console.log('Processed instructor data:', instructorData);

        // TODO: Save to database
        // await saveInstructorToDatabase(instructorData);

        return { form }
    }
};