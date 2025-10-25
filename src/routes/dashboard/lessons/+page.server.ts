import { superValidate } from "sveltekit-superforms";
import type { PageServerLoad, Actions } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { fail, redirect } from "@sveltejs/kit";
import { lessonSchema } from "$src/features/Lessons/lib/lessonSchema";
import { LessonService } from "$src/features/Lessons/lib/lessonService";
import { requireAuth } from "$src/lib/utils/auth";
import { db } from '$lib/server/db';
import { conditionalPricing, promotionalPricing } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const lessonService = new LessonService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access lessons');
    
    const lessonForm = await superValidate(zod(lessonSchema));
    
    // Get the base lesson if user is an instructor
    let baseLesson = null;
    let conditionalRules: any[] = [];
    let promos: any[] = [];
    
    if (user.role === 'instructor-independent' || user.role === 'instructor-school') {
        try {
            const lessons = await lessonService.listLessonsByInstructor(user.id);
            baseLesson = lessons.find(lesson => lesson.isBaseLesson) ?? null;
            
            // If base lesson exists, load pricing rules
            if (baseLesson) {
                // Load conditional pricing rules
                conditionalRules = await db
                    .select()
                    .from(conditionalPricing)
                    .where(eq(conditionalPricing.lessonId, baseLesson.id))
                    .orderBy(conditionalPricing.priority);
                
                // Load promotional pricing
                promos = await db
                    .select()
                    .from(promotionalPricing)
                    .where(
                        and(
                            eq(promotionalPricing.instructorId, user.id),
                            eq(promotionalPricing.lessonId, baseLesson.id)
                        )
                    );
            }
        } catch (error) {
            console.error('Error fetching lessons and pricing:', error);
        }
    }
    
    return { 
        lessonForm, 
        baseLesson,
        conditionalRules,
        promos
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

    // Conditional Pricing Actions
    createConditional: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const lessonId = parseInt(formData.get('lessonId') as string);
        const conditionType = formData.get('conditionType') as string;
        const minValue = formData.get('minValue') as string;
        const maxValue = formData.get('maxValue') as string;
        const adjustmentType = formData.get('adjustmentType') as string;
        const adjustmentValue = formData.get('adjustmentValue') as string;
        const priority = parseInt(formData.get('priority') as string) || 0;
        const isActive = formData.get('isActive') === 'on';

        try {
            await db.insert(conditionalPricing).values({
                lessonId,
                conditionType,
                minValue: minValue ? parseInt(minValue) : null,
                maxValue: maxValue ? parseInt(maxValue) : null,
                adjustmentType,
                adjustmentValue,
                priority,
                isActive
            });

            return { success: true };
        } catch (error) {
            console.error('Error creating conditional pricing:', error);
            return fail(500, { message: 'Failed to create rule' });
        }
    },

    updateConditional: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const ruleId = parseInt(formData.get('ruleId') as string);
        const conditionType = formData.get('conditionType') as string;
        const minValue = formData.get('minValue') as string;
        const maxValue = formData.get('maxValue') as string;
        const adjustmentType = formData.get('adjustmentType') as string;
        const adjustmentValue = formData.get('adjustmentValue') as string;
        const priority = parseInt(formData.get('priority') as string) || 0;
        const isActive = formData.get('isActive') === 'on';

        try {
            await db
                .update(conditionalPricing)
                .set({
                    conditionType,
                    minValue: minValue ? parseInt(minValue) : null,
                    maxValue: maxValue ? parseInt(maxValue) : null,
                    adjustmentType,
                    adjustmentValue,
                    priority,
                    isActive,
                    updatedAt: new Date()
                })
                .where(eq(conditionalPricing.id, ruleId));

            return { success: true };
        } catch (error) {
            console.error('Error updating conditional pricing:', error);
            return fail(500, { message: 'Failed to update rule' });
        }
    },

    deleteConditional: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const ruleId = parseInt(formData.get('ruleId') as string);

        try {
            await db
                .delete(conditionalPricing)
                .where(eq(conditionalPricing.id, ruleId));

            return { success: true };
        } catch (error) {
            console.error('Error deleting conditional pricing:', error);
            return fail(500, { message: 'Failed to delete rule' });
        }
    },

    // Promotional Pricing Actions
    createPromo: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const lessonId = parseInt(formData.get('lessonId') as string);
        const code = formData.get('code') as string;
        const discountType = formData.get('discountType') as string;
        const discountValue = formData.get('discountValue') as string;
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;
        const maxUses = formData.get('maxUses') as string;
        const minPurchaseAmount = formData.get('minPurchaseAmount') as string;
        const isActive = formData.get('isActive') === 'on';

        try {
            await db.insert(promotionalPricing).values({
                lessonId,
                instructorId: user.id,
                code: code || null,
                discountType,
                discountValue,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                maxUses: maxUses ? parseInt(maxUses) : null,
                currentUses: 0,
                minPurchaseAmount: minPurchaseAmount || null,
                isActive
            });

            return { success: true };
        } catch (error) {
            console.error('Error creating promo:', error);
            return fail(500, { message: 'Failed to create promotion' });
        }
    },

    updatePromo: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const promoId = parseInt(formData.get('promoId') as string);
        const code = formData.get('code') as string;
        const discountType = formData.get('discountType') as string;
        const discountValue = formData.get('discountValue') as string;
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;
        const maxUses = formData.get('maxUses') as string;
        const minPurchaseAmount = formData.get('minPurchaseAmount') as string;
        const isActive = formData.get('isActive') === 'on';

        try {
            await db
                .update(promotionalPricing)
                .set({
                    code: code || null,
                    discountType,
                    discountValue,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    maxUses: maxUses ? parseInt(maxUses) : null,
                    minPurchaseAmount: minPurchaseAmount || null,
                    isActive,
                    updatedAt: new Date()
                })
                .where(eq(promotionalPricing.id, promoId));

            return { success: true };
        } catch (error) {
            console.error('Error updating promo:', error);
            return fail(500, { message: 'Failed to update promotion' });
        }
    },

    deletePromo: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const promoId = parseInt(formData.get('promoId') as string);

        try {
            await db
                .delete(promotionalPricing)
                .where(eq(promotionalPricing.id, promoId));

            return { success: true };
        } catch (error) {
            console.error('Error deleting promo:', error);
            return fail(500, { message: 'Failed to delete promotion' });
        }
    }
};