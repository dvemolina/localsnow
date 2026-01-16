import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { ExpiringTokenBucket } from '$lib/server/rate-limit';
import { getClientIP } from '$lib/utils/auth';
import { LeadService } from '$src/features/Leads/lib/leadService';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { sendInstructorContactForm } from '$lib/server/webhooks/n8n/email-n8n';

const leadService = new LeadService();
const instructorService = new InstructorService();

// Rate limiting: 10 requests per hour per IP
const contactFormBucket = new ExpiringTokenBucket<string>(10, 3600);

export const POST: RequestHandler = async (event) => {
	// Get client IP for rate limiting
	const clientIP = getClientIP(event);
	if (clientIP === null) {
		throw error(400, 'Unable to determine client IP');
	}

	// Check rate limit
	if (!contactFormBucket.check(clientIP, 1)) {
		throw error(429, 'Too many contact requests. Please try again later.');
	}

	const instructorId = parseInt(event.params.id);
	if (isNaN(instructorId)) {
		throw error(400, 'Invalid instructor ID');
	}

	try {
		// Parse request body
		const body = await event.request.json();
		const { clientName, clientEmail, clientPhone, message, preferredDates, numberOfStudents, skillLevel } = body;

		// Validate required fields
		if (!clientEmail || typeof clientEmail !== 'string') {
			throw error(400, 'Email is required');
		}

		if (!message || typeof message !== 'string') {
			throw error(400, 'Message is required');
		}

		// Get instructor details
		const instructor = await instructorService.getInstructorById(instructorId);

		if (!instructor) {
			throw error(404, 'Instructor not found');
		}

		// Check if instructor profile is published (unless contacted by the instructor themselves)
		const isOwnProfile = event.locals.user?.id === instructorId;
		if (!instructor.isPublished && !isOwnProfile) {
			throw error(404, 'Instructor profile is not available');
		}

		// Create lead using LeadService (includes validation)
		const lead = await leadService.createLead({
			instructorId,
			clientName: clientName || undefined,
			clientEmail,
			clientPhone: clientPhone || undefined,
			message,
			preferredDates: preferredDates || undefined,
			numberOfStudents: numberOfStudents || undefined,
			skillLevel: skillLevel || undefined
		});

		// Send email notification to instructor
		try {
			await sendInstructorContactForm({
				instructorEmail: instructor.email,
				instructorName: instructor.name,
				clientName: clientName || 'Not provided',
				clientEmail,
				clientPhone: clientPhone || undefined,
				message,
				instructorProfileUrl: `https://localsnow.org/instructors/${instructorId}`
			});
		} catch (emailError) {
			console.error('Failed to send contact form email notification:', emailError);
			// Don't throw - email failure shouldn't break the contact form submission
		}

		// Consume rate limit token after successful processing
		contactFormBucket.consume(clientIP, 1);

		return json({
			success: true,
			leadId: lead.id,
			message: 'Your message has been sent to the instructor'
		});
	} catch (err) {
		console.error('Error processing contact form:', err);

		// Re-throw SvelteKit errors (validation errors from LeadService)
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		// Handle validation errors from LeadService
		if (err instanceof Error && err.message) {
			if (err.message.includes('Invalid email') || err.message.includes('Message must be')) {
				throw error(400, err.message);
			}
		}

		throw error(500, 'Failed to send message. Please try again.');
	}
};
