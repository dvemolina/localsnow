// src/routes/dashboard/profile/+page.server.ts
import { userProfileSchema } from "$src/features/Users/lib/validations/userSchemas";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { UserService } from "$src/features/Users/lib/UserService";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit";
import { getClientIP } from "$src/lib/utils/auth";
import { instructorProfileSchema } from "$src/features/Instructors/lib/instructorSchemas";
import { InstructorService } from "$src/features/Instructors/lib/instructorService";
import { schoolProfileSchema } from "$src/features/Schools/lib/validations/schoolSchemas";
import { SchoolService } from "$src/features/Schools/lib/schoolService";
import { StorageService } from "$src/lib/server/R2Storage";
import { db } from "$lib/server/db";
import { countries, regions, resortRequests } from "$lib/server/db/schema";
import { hasInstructorRole, hasRole } from "$src/lib/utils/roles";
import { eq, desc } from "drizzle-orm";

const userService = new UserService();
const instructorService = new InstructorService();
const schoolService = new SchoolService();
const storageService = new StorageService();
const ipBucket = new RefillingTokenBucket<string>(5, 60); // 5 requests per minute
 
export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    if (!user) redirect(302, '/login');
    
    // Fetch full user data
    const fullUser = await userService.getUserById(user.id);
    if (!fullUser) redirect(302, '/login');
    const userWithRoles = {
        ...fullUser,
        roles: user.roles && user.roles.length > 0 ? user.roles : user.role ? [user.role] : []
    };
    
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
    if (hasInstructorRole(user)) {
        const instructorData = await instructorService.getInstructorWithRelations(user.id);

        instructorForm = await superValidate(
            {
                bio: fullUser.bio || '',
                professionalCountryCode: fullUser.professionalCountryCode ? parseInt(fullUser.professionalCountryCode) : 1,
                professionalPhone: fullUser.professionalPhone || '',
                resort: instructorData.resorts[0]?.id ?? 0,
                sports: instructorData.sports || [],
                spokenLanguages: fullUser.spokenLanguages || []
            },
            zod(instructorProfileSchema)
        );
    }

    // For school admins, pre-populate school form
    let schoolForm = null;
    if (hasRole(user, 'school-admin')) {
        const school = await schoolService.getSchoolByOwner(user.id);

        if (school) {
            const resorts = await schoolService.getSchoolResorts(school.id);
            schoolForm = await superValidate(
                {
                    name: school.name || '',
                    bio: school.bio || '',
                    countryCode: school.countryCode ? parseInt(school.countryCode) : 1,
                    schoolPhone: school.schoolPhone || '',
                    schoolEmail: school.schoolEmail || '',
                    resort: resorts[0] || 0
                },
                zod(schoolProfileSchema)
            );
        }
    }

    // Load countries and regions for resort request form
    const allCountries = await db.query.countries.findMany({
        orderBy: (countries, { asc }) => [asc(countries.country)]
    });

    const allRegions = await db.query.regions.findMany({
        orderBy: (regions, { asc }) => [asc(regions.region)]
    });

    // Fetch pending resort requests for instructors
    let pendingResortRequests = [];
    if (hasInstructorRole(user)) {
        pendingResortRequests = await db.query.resortRequests.findMany({
            where: eq(resortRequests.requesterId, user.id),
            orderBy: [desc(resortRequests.createdAt)],
            limit: 5
        });
    }

    return {
        userForm,
        instructorForm,
        schoolForm,
        user: userWithRoles,
        countries: allCountries,
        regions: allRegions,
        pendingResortRequests
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
    if (!hasInstructorRole(user)) {
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
        // Get current user data to preserve existing URLs
        const currentUser = await userService.getUserById(user.id);
        
        let profileImageUrl: string | null | undefined = undefined;
        let qualificationUrl: string | null | undefined = undefined;

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
            spokenLanguages: form.data.spokenLanguages,
            // Only update if new file was uploaded, otherwise keep existing
            profileImageUrl: profileImageUrl !== undefined ? profileImageUrl : currentUser?.profileImageUrl,
            qualificationUrl: qualificationUrl !== undefined ? qualificationUrl : currentUser?.qualificationUrl
        });

        form.data.profileImage = undefined;
        form.data.qualification = undefined;

        return { form, success: true };
    } catch (error) {
        console.error('Error updating instructor profile:', error);
        return fail(500, {
            form,
            error: 'Failed to update instructor profile. Please try again.'
        });
    }
},

    schoolProfile: async (event) => {
        const user = event.locals.user;
        if (!user) redirect(302, '/login');
        if (!hasRole(user, 'school-admin')) {
            return fail(403, { message: 'Not authorized' });
        }

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
            // Get the school owned by this user
            const school = await schoolService.getSchoolByOwner(user.id);
            if (!school) {
                return fail(404, {
                    form,
                    error: 'School not found. Please contact support.'
                });
            }

            let logoUrl: string | null | undefined = undefined;

            // Process logo if uploaded
            if (form.data.logo && form.data.logo.size > 0) {
                const logoArrayBuffer = await form.data.logo.arrayBuffer();
                const logoBuffer = Buffer.from(logoArrayBuffer);
                logoUrl = await storageService.uploadSchoolLogo(logoBuffer, school.name, user.id);
            }

            // Update school profile
            await schoolService.updateSchool(school.id, {
                name: form.data.name,
                bio: form.data.bio || undefined,
                countryCode: form.data.countryCode,
                schoolPhone: form.data.schoolPhone,
                schoolEmail: form.data.schoolEmail,
                resort: form.data.resort
            }, logoUrl !== undefined ? logoUrl : school.logo);

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
