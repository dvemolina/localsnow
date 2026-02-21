import { superValidate } from "sveltekit-superforms";
import type { PageServerLoad, Actions } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { lessonSchema } from "$src/features/Lessons/lib/lessonSchema";
import { LessonService } from "$src/features/Lessons/lib/lessonService";
import { LessonRepository } from "$src/features/Lessons/lib/lessonRepository";
import { SchoolInstructorRepository } from "$src/features/Schools/lib/schoolInstructorRepository";
import { db } from '$lib/server/db';
import { groupPricingTiers, durationPackages, promoCodes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireDashboardRole } from "$src/lib/utils/dashboardAuth";

const lessonService = new LessonService();
const lessonRepository = new LessonRepository();
const schoolInstructorRepository = new SchoolInstructorRepository();

export const load: PageServerLoad = async (event) => {
    const user = requireDashboardRole(event, ['instructor-independent', 'instructor-school'], 'Login to access lessons');

    const lessonForm = await superValidate(zod(lessonSchema));

    let baseLesson = null;
    let groupTiers: any[] = [];
    let durationPackagesList: any[] = [];
    let promoCodesList: any[] = [];

    // For school instructors, also fetch their affiliated school and school fares
    let affiliatedSchool = null;
    let schoolBaseLesson = null;
    let schoolGroupTiers: any[] = [];
    let schoolDurationPackages: any[] = [];

    try {
        const lessons = await lessonService.listLessonsByInstructor(user.id);
        baseLesson = lessons.find(lesson => lesson.isBaseLesson) ?? null;

        if (baseLesson) {
            [groupTiers, durationPackagesList, promoCodesList] = await Promise.all([
                db.select().from(groupPricingTiers).where(eq(groupPricingTiers.lessonId, baseLesson.id)),
                db.select().from(durationPackages).where(eq(durationPackages.lessonId, baseLesson.id)),
                db.select().from(promoCodes).where(eq(promoCodes.lessonId, baseLesson.id))
            ]);
        }
    } catch (error) {
        console.error('Error fetching lessons and pricing:', error);
    }

    // If user is a school instructor, fetch their school's fares
    if (user.role === 'instructor-school') {
        try {
            affiliatedSchool = await schoolInstructorRepository.getInstructorSchool(user.id);
            if (affiliatedSchool) {
                const schoolLessons = await lessonRepository.listLessonsBySchool(affiliatedSchool.id);
                schoolBaseLesson = schoolLessons.find(l => l.isBaseLesson) ?? null;
                if (schoolBaseLesson) {
                    [schoolGroupTiers, schoolDurationPackages] = await Promise.all([
                        db.select().from(groupPricingTiers).where(eq(groupPricingTiers.lessonId, schoolBaseLesson.id)),
                        db.select().from(durationPackages).where(eq(durationPackages.lessonId, schoolBaseLesson.id))
                    ]);
                }
            }
        } catch (error) {
            console.error('Error fetching school fares:', error);
        }
    }

    return {
        lessonForm,
        baseLesson,
        groupTiers,
        durationPackages: durationPackagesList,
        promoCodes: promoCodesList,
        affiliatedSchool,
        schoolBaseLesson,
        schoolGroupTiers,
        schoolDurationPackages,
        isSchoolInstructor: user.role === 'instructor-school'
    };
};

export const actions: Actions = {
    saveBaseLesson: async (event) => {
        const user = requireDashboardRole(
            event,
            ['instructor-independent', 'instructor-school'],
            'Session expired. Please login again.'
        );

        const form = await superValidate(event.request, zod(lessonSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            // Check if user already has a base lesson
            const existingLessons = await lessonService.listLessonsByInstructor(user.id);
            const existingBaseLesson = existingLessons.find(lesson => lesson.isBaseLesson);

            const lessonData = {
                title: form.data.title,
                description: form.data.description,
                basePrice: form.data.basePrice,
                currency: form.data.currency,
                duration: form.data.duration || '1h',
                instructorId: user.id,
                isPublished: true,
                isBaseLesson: true,
            };

            const sportIds = form.data.sports;

            if (existingBaseLesson) {
                // Update existing base lesson
                await lessonService.updateLesson(existingBaseLesson.id, lessonData, sportIds);
            } else {
                // Create new base lesson
                await lessonService.createLesson(lessonData, sportIds);
            }

            return { form, success: true };
        } catch (error) {
            console.error('Error saving base lesson:', error);
            return fail(500, {
                form,
                message: 'Failed to save lesson. Please try again.'
            });
        }
    },
    // ADD these new actions to your existing +page.server.ts:

createGroupTier: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const lessonId = parseInt(formData.get('lessonId') as string);
    const minStudents = parseInt(formData.get('minStudents') as string);
    const maxStudents = parseInt(formData.get('maxStudents') as string);
    const pricePerHour = parseInt(formData.get('pricePerHour') as string);

    try {
        await db.insert(groupPricingTiers).values({
            lessonId,
            minStudents,
            maxStudents,
            pricePerHour
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating group tier:', error);
        return fail(500, { message: 'Failed to create group tier' });
    }
},

updateGroupTier: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const tierId = parseInt(formData.get('tierId') as string);
    const minStudents = parseInt(formData.get('minStudents') as string);
    const maxStudents = parseInt(formData.get('maxStudents') as string);
    const pricePerHour = parseInt(formData.get('pricePerHour') as string);

    try {
        await db.update(groupPricingTiers)
            .set({ minStudents, maxStudents, pricePerHour, updatedAt: new Date() })
            .where(eq(groupPricingTiers.id, tierId));
        return { success: true };
    } catch (error) {
        console.error('Error updating group tier:', error);
        return fail(500, { message: 'Failed to update group tier' });
    }
},

deleteGroupTier: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const tierId = parseInt(formData.get('tierId') as string);

    try {
        await db.delete(groupPricingTiers).where(eq(groupPricingTiers.id, tierId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting group tier:', error);
        return fail(500, { message: 'Failed to delete group tier' });
    }
},

createDurationPackage: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const lessonId = parseInt(formData.get('lessonId') as string);
    const name = formData.get('name') as string;
    const hours = parseFloat(formData.get('hours') as string);
    const price = parseInt(formData.get('price') as string);
    const minStudents = parseInt(formData.get('minStudents') as string) || 1;
    const maxStudents = parseInt(formData.get('maxStudents') as string) || 6;
    const description = formData.get('description') as string;

    try {
        await db.insert(durationPackages).values({
            lessonId, name, hours, price, minStudents, maxStudents,
            description: description || null
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating duration package:', error);
        return fail(500, { message: 'Failed to create package' });
    }
},

updateDurationPackage: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const packageId = parseInt(formData.get('packageId') as string);
    const name = formData.get('name') as string;
    const hours = parseFloat(formData.get('hours') as string);
    const price = parseInt(formData.get('price') as string);
    const minStudents = parseInt(formData.get('minStudents') as string) || 1;
    const maxStudents = parseInt(formData.get('maxStudents') as string) || 6;
    const description = formData.get('description') as string;

    try {
        await db.update(durationPackages)
            .set({ name, hours, price, minStudents, maxStudents, description: description || null, updatedAt: new Date() })
            .where(eq(durationPackages.id, packageId));
        return { success: true };
    } catch (error) {
        console.error('Error updating package:', error);
        return fail(500, { message: 'Failed to update package' });
    }
},

deleteDurationPackage: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const packageId = parseInt(formData.get('packageId') as string);

    try {
        await db.delete(durationPackages).where(eq(durationPackages.id, packageId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting package:', error);
        return fail(500, { message: 'Failed to delete package' });
    }
},

createPromoCode: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const lessonId = parseInt(formData.get('lessonId') as string);
    const code = formData.get('code') as string;
    const discountPercent = parseInt(formData.get('discountPercent') as string);
    const validUntil = formData.get('validUntil') as string;
    const maxUses = formData.get('maxUses') as string;

    try {
        await db.insert(promoCodes).values({
            lessonId,
            instructorId: user.id,
            code: code.toUpperCase(),
            discountPercent,
            validUntil: validUntil ? new Date(validUntil) : null,
            maxUses: maxUses ? parseInt(maxUses) : null,
            currentUses: 0
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating promo code:', error);
        return fail(500, { message: 'Failed to create promo code' });
    }
},

updatePromoCode: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const promoId = parseInt(formData.get('promoId') as string);
    const code = formData.get('code') as string;
    const discountPercent = parseInt(formData.get('discountPercent') as string);
    const validUntil = formData.get('validUntil') as string;
    const maxUses = formData.get('maxUses') as string;

    try {
        await db.update(promoCodes)
            .set({
                code: code.toUpperCase(),
                discountPercent,
                validUntil: validUntil ? new Date(validUntil) : null,
                maxUses: maxUses ? parseInt(maxUses) : null,
                updatedAt: new Date()
            })
            .where(eq(promoCodes.id, promoId));
        return { success: true };
    } catch (error) {
        console.error('Error updating promo code:', error);
        return fail(500, { message: 'Failed to update promo code' });
    }
},

deletePromoCode: async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent'],
        'Session expired. Please login again.'
    );

    const formData = await event.request.formData();
    const promoId = parseInt(formData.get('promoId') as string);

    try {
        await db.delete(promoCodes).where(eq(promoCodes.id, promoId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting promo code:', error);
        return fail(500, { message: 'Failed to delete promo code' });
    }
}
    
};
