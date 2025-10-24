// src/routes/dashboard/profile/+page.server.ts
import { userProfileSchema } from "$src/features/Users/lib/validations/userSchemas.js";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { UserService } from "$src/features/Users/lib/UserService.js";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit.js";
import { getClientIP } from "$src/lib/utils/auth.js";
import { instructorProfileSchema } from "$src/features/Instructors/lib/instructorSchemas.js";
import { InstructorService } from "$src/features/Instructors/lib/instructorService.js";
import { StorageService } from "$src/lib/server/R2Storage.js";

const userService = new UserService();
const instructorService = new InstructorService();
const storageService = new StorageService();
const ipBucket = new RefillingTokenBucket<string>(5, 60); // 5 requests per minute
 
export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    if (!user) redirect(302, '/login');
    
    // Fetch full user data
    const fullUser = await userService.getUserById(user.id);
    if (!fullUser) redirect(302, '/login');
    
    // Pre-populate forms with existing user data
    const userForm = await superValidate(
        {
            name: fullUser.name,
            lastName: fullUser.lastName,
            email: fullUser.email,
            countryCode: fullUser.countryCode ? parseInt(fullUser.countryCode) : undefined,
            phone: fullUser.phone || ''
        },
        zod(userProfileSchema)
    );

    // For instructors, pre-populate instructor form
    let instructorForm = null;
    if (user.role === 'instructor-independent' || user.role === 'instructor-school') {
        const instructorData = await instructorService.getInstructorWithRelations(user.id);
        
        instructorForm = await superValidate(
            {
                bio: fullUser.bio || '',
                professionalCountryCode: fullUser.professionalCountryCode ? parseInt(fullUser.professionalCountryCode) : 1,
                professionalPhone: fullUser.professionalPhone || '',
                resort: instructorData.resorts[0] || 0,
                sports: instructorData.sports || []
            },
            zod(instructorProfileSchema)
        );
    }

    return { 
        userForm, 
        instructorForm,
        user: fullUser 
    };
};

export const actions: Actions = {
    userProfile: async (event) => {
        const user = event.locals.user;
        if (!user) redirect(302, '/login');

        // Rate limiting
        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests. Please try again later."
            });
        }

        const form = await superValidate(event.request, zod(userProfileSchema));
        
        if (!form.valid) {
            return fail(400, { form });
        }

        // Check if email is already taken by another user
        const fullUser = await userService.getUserById(user.id);
        if (form.data.email !== fullUser?.email) {
            const emailExists = await userService.getUserByEmail(form.data.email);
            if (emailExists && emailExists.id !== user.id) {
                return setError(form, 'email', 'This email is already registered', { status: 409 });
            }
        }

        try {
            await userService.updateUser(user.id, {
                name: form.data.name,
                lastName: form.data.lastName,
                email: form.data.email,
                countryCode: form.data.countryCode?.toString(),
                phone: form.data.phone
            });

            return { form, success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return fail(500, { 
                form, 
                error: 'Failed to update profile. Please try again.' 
            });
        }
    },

    instructorProfile: async (event) => {
        const user = event.locals.user;
        if (!user) redirect(302, '/login');
        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Not authorized' });
        }

        // Rate limiting
        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests. Please try again later."
            });
        }

        const form = await superValidate(event.request, zod(instructorProfileSchema));
        
        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            let profileImageUrl: string | null = null;
            let qualificationUrl: string | null = null;

            // Process profile image if uploaded
            if (form.data.profileImage && form.data.profileImage.size > 0) {
                const imageArrayBuffer = await form.data.profileImage.arrayBuffer();
                const imageBuffer = Buffer.from(imageArrayBuffer);
                profileImageUrl = await storageService.uploadProfileImage(imageBuffer, user.id);
            }

            // Process qualification PDF if uploaded
            if (form.data.qualification && form.data.qualification.size > 0) {
                const pdfArrayBuffer = await form.data.qualification.arrayBuffer();
                const pdfBuffer = Buffer.from(pdfArrayBuffer);
                qualificationUrl = await storageService.uploadQualificationPDF(pdfBuffer, user.id);
            }

            // Update instructor profile
            await instructorService.updateInstructorProfile(user.id, {
                bio: form.data.bio,
                professionalCountryCode: form.data.professionalCountryCode,
                professionalPhone: form.data.professionalPhone,
                resort: form.data.resort,
                sports: form.data.sports,
                profileImageUrl,
                qualificationUrl
            });

            return { form, success: true };
        } catch (error) {
            console.error('Error updating instructor profile:', error);
            return fail(500, { 
                form, 
                error: 'Failed to update instructor profile. Please try again.' 
            });
        }
    }
};