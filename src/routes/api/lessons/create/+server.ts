import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InstructorLessonService } from '$src/features/InstructorLessons/lib/instructorLessonService';
import { createLessonSchema } from '$src/features/InstructorLessons/lib/instructorLessonSchema';
import type { CreateLessonData } from '$src/features/InstructorLessons/lib/instructorLessonRepository';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Check if user is an instructor
	if (
		locals.user.role !== 'instructor-independent' &&
		locals.user.role !== 'instructor-school'
	) {
		throw error(403, 'Only instructors can create lessons');
	}

	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = createLessonSchema.parse(body);

		// Create lesson data object
		const lessonData: CreateLessonData = {
			instructorId: locals.user.id,
			clientName: validatedData.clientName,
			clientEmail: validatedData.clientEmail,
			clientCountryCode: validatedData.clientCountryCode,
			clientPhone: validatedData.clientPhone,
			lessonDate: new Date(validatedData.lessonDate),
			duration: validatedData.duration,
			numberOfStudents: validatedData.numberOfStudents,
			sport: validatedData.sport,
			skillLevel: validatedData.skillLevel,
			resortId: validatedData.resortId,
			resortName: validatedData.resortName,
			instructorNotes: validatedData.instructorNotes,
			source: 'manual'
		};

		// Create lesson via service
		const service = new InstructorLessonService();
		const lesson = await service.createManualLesson(lessonData);

		return json(lesson, { status: 201 });
	} catch (err: any) {
		console.error('Error creating lesson:', err);

		// Handle validation errors
		if (err.name === 'ZodError') {
			throw error(400, { message: 'Validation failed', errors: err.errors });
		}

		// Handle service errors
		throw error(400, err.message || 'Failed to create lesson');
	}
};
