import { superValidate } from "sveltekit-superforms";
import type { PageServerLoad, Actions } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { lessonSchema } from "$src/features/Lessons/lib/lessonSchema";
import { LessonService } from "$src/features/Lessons/lib/lessonService";
import { requireAuth } from "$src/lib/utils/auth";

const lessonService = new LessonService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access lessons');
    
    const lessonForm = await superValidate(zod(lessonSchema));
    
    // Get the base lesson if user is an instructor
    let baseLesson = null;
    if (user.role === 'instructor-independent' || user.role === 'instructor-school') {
        try {
            const lessons = await lessonService.listLessonsByInstructor(user.id);
            baseLesson = lessons.find(lesson => lesson.isBaseLesson) ?? null;
        } catch (error) {
            console.error('Error fetching base lesson:', error);
        }
    }
    
    return { lessonForm, baseLesson };
};

export const actions: Actions = {
    saveBaseLesson: async (event) => {
        const user = requireAuth(event, 'Session expired. Please login again.');
        
        // Only instructors can create base lessons
        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Only instructors can create lessons' });
        }
        
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
    }
};