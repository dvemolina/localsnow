import { superValidate } from "sveltekit-superforms";
import type { PageServerLoad, Actions } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { fail, redirect } from "@sveltejs/kit";
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
    }
};