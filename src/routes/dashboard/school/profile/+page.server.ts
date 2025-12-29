import { requireSchoolAdmin } from "$src/lib/utils/schoolAuth.js";
import type { PageServerLoad, Actions } from "./$types.js";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { schoolProfileSchema } from "$src/features/Schools/lib/validations/schoolSchemas.js";
import { SchoolRepository } from "$src/features/Schools/lib/schoolRepository.js";
import { StorageService } from "$src/lib/server/R2Storage.js";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit.js";
import { getClientIP } from "$src/lib/utils/auth.js";

const schoolRepository = new SchoolRepository();
const storageService = new StorageService();
const ipBucket = new RefillingTokenBucket<string>(5, 60); // 5 requests per minute

export const load: PageServerLoad = async (event) => {
    const { user, school } = await requireSchoolAdmin(event);
    const resorts = await schoolRepository.getSchoolResorts(school.id);

    const form = await superValidate(
        {
            name: school.name,
            bio: school.bio || '',
            schoolEmail: school.schoolEmail,
            countryCode: school.countryCode ? parseInt(school.countryCode) : 1,
            schoolPhone: school.schoolPhone,
            resort: resorts[0] || 0
        },
        zod(schoolProfileSchema)
    );

    return { form, school };
};

export const actions: Actions = {
    default: async (event) => {
        const { user, school } = await requireSchoolAdmin(event);

        // Rate limiting
        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests. Please try again later."
            });
        }

        const form = await superValidate(event.request, zod(schoolProfileSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            let logoUrl: string | null | undefined = undefined;

            // Process logo if uploaded
            if (form.data.logo && form.data.logo.size > 0) {
                const logoArrayBuffer = await form.data.logo.arrayBuffer();
                const logoBuffer = Buffer.from(logoArrayBuffer);
                logoUrl = await storageService.uploadSchoolLogo(logoBuffer, school.id);
            }

            // Update school profile
            await schoolRepository.updateSchool(school.id, {
                name: form.data.name,
                bio: form.data.bio,
                schoolEmail: form.data.schoolEmail,
                countryCode: form.data.countryCode.toString(),
                schoolPhone: form.data.schoolPhone,
                resort: form.data.resort,
                logo: logoUrl !== undefined ? logoUrl : school.logo
            });

            form.data.logo = undefined;

            return { form, success: true };
        } catch (error) {
            console.error('Error updating school profile:', error);
            return fail(500, {
                form,
                error: 'Failed to update school profile. Please try again.'
            });
        }
    }
};
