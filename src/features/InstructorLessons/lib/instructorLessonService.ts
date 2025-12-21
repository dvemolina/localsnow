import { InstructorLessonRepository } from './instructorLessonRepository';
import type { CreateLessonData, LessonWithRelations, ClientSummary } from './instructorLessonRepository';
import type { InstructorLesson } from '$lib/server/db/schema';
import { sendReviewRequestEmail } from '$lib/server/webhooks/n8n/email-n8n';
import { PROJECT_URL } from '$lib/server/config';

export class InstructorLessonService {
	private repository: InstructorLessonRepository;

	constructor() {
		this.repository = new InstructorLessonRepository();
	}

	/**
	 * Create a manual lesson entry
	 * Validates all inputs and generates review token
	 */
	async createManualLesson(data: CreateLessonData): Promise<InstructorLesson> {
		// Validate required fields
		if (!data.clientName || data.clientName.trim().length === 0) {
			throw new Error('Client name is required');
		}

		if (!data.clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.clientEmail)) {
			throw new Error('Valid client email is required');
		}

		if (!data.lessonDate || !(data.lessonDate instanceof Date) || isNaN(data.lessonDate.getTime())) {
			throw new Error('Valid lesson date is required');
		}

		// Validate duration
		if (!data.duration || data.duration <= 0 || data.duration > 12) {
			throw new Error('Duration must be between 0.5 and 12 hours');
		}

		// Validate number of students
		if (!data.numberOfStudents || data.numberOfStudents < 1 || data.numberOfStudents > 20) {
			throw new Error('Number of students must be between 1 and 20');
		}

		// Validate sport if provided
		const validSports = ['Ski', 'Snowboard', 'Telemark'];
		if (data.sport && !validSports.includes(data.sport)) {
			throw new Error(`Sport must be one of: ${validSports.join(', ')}`);
		}

		// Trim whitespace from strings
		const cleanedData: CreateLessonData = {
			...data,
			clientName: data.clientName.trim(),
			clientEmail: data.clientEmail.toLowerCase().trim(),
			source: data.source || 'manual'
		};

		// Create lesson via repository
		const lesson = await this.repository.createLesson(cleanedData);
		return lesson;
	}

	/**
	 * Generate a shareable review link for a lesson
	 * Verifies ownership before returning link
	 */
	async generateReviewLink(
		lessonId: number,
		instructorId: number
	): Promise<{ url: string; token: string }> {
		// Get lesson with ownership check
		const lesson = await this.repository.getLessonById(lessonId, instructorId);

		if (!lesson) {
			throw new Error('Lesson not found or unauthorized');
		}

		if (!lesson.reviewToken) {
			throw new Error('Lesson does not have a review token');
		}

		// Build review URL
		const reviewUrl = `${PROJECT_URL}/reviews/submit-manual?token=${lesson.reviewToken}`;

		return {
			url: reviewUrl,
			token: lesson.reviewToken
		};
	}

	/**
	 * Send review request email to client
	 * Prevents duplicate sends and validates lesson status
	 */
	async sendReviewRequest(
		lessonId: number,
		instructorId: number
	): Promise<{ success: boolean; reviewUrl: string }> {
		// Get lesson with ownership check
		const lesson = await this.repository.getLessonById(lessonId, instructorId);

		if (!lesson) {
			throw new Error('Lesson not found or unauthorized');
		}

		// Check if review request already sent
		if (lesson.reviewRequestSent) {
			throw new Error('Review request has already been sent for this lesson');
		}

		// Check if review already exists
		if (lesson.review) {
			throw new Error('A review already exists for this lesson');
		}

		// Generate review link
		const { url: reviewUrl } = await this.generateReviewLink(lessonId, instructorId);

		// Format lesson date for email
		const lessonDateFormatted = new Date(lesson.lessonDate).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		// Send email via n8n
		try {
			await sendReviewRequestEmail({
				clientEmail: lesson.clientEmail,
				clientName: lesson.clientName,
				instructorName: lesson.instructor
					? `${lesson.instructor.name} ${lesson.instructor.lastName}`
					: 'Your Instructor',
				lessonDate: lessonDateFormatted,
				reviewUrl
			});

			// Mark as sent
			await this.repository.markReviewRequestSent(lessonId);

			return { success: true, reviewUrl };
		} catch (error) {
			console.error('Failed to send review request email:', error);
			throw new Error('Failed to send review request email');
		}
	}

	/**
	 * Get all lessons for an instructor
	 */
	async getInstructorLessons(instructorId: number): Promise<LessonWithRelations[]> {
		return await this.repository.getInstructorLessons(instructorId);
	}

	/**
	 * Get client list (CRM) for an instructor
	 */
	async getClientList(instructorId: number): Promise<ClientSummary[]> {
		return await this.repository.getInstructorClients(instructorId);
	}

	/**
	 * Update lesson notes
	 * Notes are private and only visible to the instructor
	 */
	async updateLessonNotes(
		lessonId: number,
		instructorId: number,
		notes: string
	): Promise<InstructorLesson> {
		// Verify ownership
		const lesson = await this.repository.getLessonById(lessonId, instructorId);

		if (!lesson) {
			throw new Error('Lesson not found or unauthorized');
		}

		// Update notes (can be empty string to clear)
		return await this.repository.updateLesson(lessonId, {
			instructorNotes: notes
		});
	}

	/**
	 * Delete a lesson (soft delete)
	 * Reviews are preserved even if lesson is deleted
	 */
	async deleteLesson(lessonId: number, instructorId: number): Promise<void> {
		// Verify ownership
		const lesson = await this.repository.getLessonById(lessonId, instructorId);

		if (!lesson) {
			throw new Error('Lesson not found or unauthorized');
		}

		// Note: We allow deletion even if a review exists
		// Reviews are preserved via soft delete and will still appear on instructor profile
		await this.repository.deleteLesson(lessonId);
	}

	/**
	 * Get lesson by review token (for public review submission)
	 */
	async getLessonByReviewToken(token: string) {
		return await this.repository.getLessonByReviewToken(token);
	}
}
