import { superValidate } from "sveltekit-superforms";
import type { PageServerLoad, Actions } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { lessonSchema } from "$src/features/Lessons/lib/lessonSchema";
import { LessonService } from "$src/features/Lessons/lib/lessonService";
import { requireAuth } from "$src/lib/utils/auth";
import { db } from '$lib/server/db';
import { groupPricingTiers, durationPackages, promoCodes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const lessonService = new LessonService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access lessons');
    
    const lessonForm = await superValidate(zod(lessonSchema));
    
    // Get the base lesson if user is an instructor
    let baseLesson = null;
    // Replace this part in your load function:
    let groupTiers: any[] = [];
    let durationPackagesList: any[] = [];
    let promoCodesList: any[] = [];

    if (user.role === 'instructor-independent' || user.role === 'instructor-school') {
        try {
            const lessons = await lessonService.listLessonsByInstructor(user.id);
            baseLesson = lessons.find(lesson => lesson.isBaseLesson) ?? null;
            
            if (baseLesson) {
                // Load new pricing structures
                [groupTiers, durationPackagesList, promoCodesList] = await Promise.all([
                    db.select().from(groupPricingTiers).where(eq(groupPricingTiers.lessonId, baseLesson.id)),
                    db.select().from(durationPackages).where(eq(durationPackages.lessonId, baseLesson.id)),
                    db.select().from(promoCodes).where(eq(promoCodes.lessonId, baseLesson.id))
                ]);
            }
        } catch (error) {
            console.error('Error fetching lessons and pricing:', error);
        }
    }

    return { 
        lessonForm, 
        baseLesson,
        groupTiers,
        durationPackages: durationPackagesList,
        promoCodes: promoCodesList
    };
};

export const actions: Actions = {
    saveBaseLesson: async (event) => {
        const user = requireAuth(event, 'Session expired. Please login again.');
        
        console.log('=== saveBaseLesson action called ===');
        console.log('User:', { id: user.id, role: user.role });
        
        // Only instructors can create base lessons
        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Only instructors can create lessons' });
        }
        
        const form = await superValidate(event.request, zod(lessonSchema));
        
        console.log('Form valid:', form.valid);
        console.log('Form data:', form.data);
        console.log('Form errors:', form.errors);
        
        if (!form.valid) {
            return fail(400, { form });
        }
        
        try {
            // Check if user already has a base lesson
            const existingLessons = await lessonService.listLessonsByInstructor(user.id);
            const existingBaseLesson = existingLessons.find(lesson => lesson.isBaseLesson);
            
            console.log('Existing base lesson:', existingBaseLesson);
            
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
            
            console.log('Lesson data to save:', lessonData);
            console.log('Sport IDs:', form.data.sports);
            
            const sportIds = form.data.sports;
            
            if (existingBaseLesson) {
                // Update existing base lesson
                console.log('Updating existing base lesson...');
                await lessonService.updateLesson(existingBaseLesson.id, lessonData, sportIds);
            } else {
                // Create new base lesson
                console.log('Creating new base lesson...');
                await lessonService.createLesson(lessonData, sportIds);
            }
            
            console.log('=== Lesson saved successfully ===');
            return { form, success: true };
        } catch (error) {
            console.error('=== Error saving base lesson ===');
            console.error('Error:', error);
            console.error('Error name:', error?.name);
            console.error('Error message:', error?.message);
            console.error('Error stack:', error?.stack);
            return fail(500, { 
                form, 
                message: 'Failed to save lesson. Please try again.' 
            });
        }
    },
    // ADD these new actions to your existing +page.server.ts:

createGroupTier: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
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

updateGroupTier: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
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

deleteGroupTier: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
    const tierId = parseInt(formData.get('tierId') as string);

    try {
        await db.delete(groupPricingTiers).where(eq(groupPricingTiers.id, tierId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting group tier:', error);
        return fail(500, { message: 'Failed to delete group tier' });
    }
},

ccreateDurationPackage: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
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

updateDurationPackage: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
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

deleteDurationPackage: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
    const packageId = parseInt(formData.get('packageId') as string);

    try {
        await db.delete(durationPackages).where(eq(durationPackages.id, packageId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting package:', error);
        return fail(500, { message: 'Failed to delete package' });
    }
},

createPromoCode: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
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

updatePromoCode: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
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

deletePromoCode: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { message: 'Unauthorized' });

    const formData = await request.formData();
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