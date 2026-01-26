/**
 * Email service - Main service class for sending all types of emails
 */

import * as templates from './templates';
import * as schemas from './schemas';
import { sendViaWebhook } from './sender';
import type { SendEmailOptions, Locale } from './types';

export class EmailService {
	/**
	 * Send email via webhook
	 * Can be used for custom email sending beyond templated emails
	 */
	async send(options: SendEmailOptions): Promise<void> {
		// Basic email validation
		if (!options.to || !options.to.includes('@')) {
			throw new Error('Invalid email address');
		}

		await sendViaWebhook({
			email: options.to,
			subject: options.subject,
			html: options.html,
			sendTelegram: options.sendTelegram,
			telegramMessage: options.telegramMessage
		});
	}

	/**
	 * Send welcome email after user signup
	 */
	async sendSignupEmail(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.signupWelcomeSchema.parse(data);
			const { subject, html } = templates.signupWelcome(validated, locale);

			await this.send({
				to: validated.email,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `🎉 New User Signup\n- Name: ${validated.name}\n- Email: ${validated.email}\n- Beta Code: ${validated.betaCode}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send signup email:', error);
			throw error;
		}
	}

	/**
	 * Send booking notification to instructor
	 */
	async sendBookingNotificationToInstructor(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.bookingNotificationInstructorSchema.parse(data);
			const { subject, html } = templates.bookingNotificationInstructor(validated, locale);

			await this.send({
				to: validated.instructorEmail,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `📅 New Booking Request\n- Instructor: ${validated.instructorName}\n- Client: ${validated.clientName}\n- Booking ID: #${validated.bookingRequestId}\n- Dates: ${validated.startDate}${validated.endDate ? ' - ' + validated.endDate : ''}\n- Students: ${validated.numberOfStudents}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send booking notification to instructor:', error);
			throw error;
		}
	}

	/**
	 * Send booking confirmation to client
	 */
	async sendBookingConfirmationToClient(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.bookingConfirmationClientSchema.parse(data);
			const { subject, html } = templates.bookingConfirmationClient(validated, locale);

			await this.send({
				to: validated.clientEmail,
				subject,
				html
			});
		} catch (error) {
			console.error('[EmailService] Failed to send booking confirmation to client:', error);
			throw error;
		}
	}

	/**
	 * Send contact info to instructor (with full client details)
	 */
	async sendContactInfoToInstructor(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.bookingContactInfoSchema.parse(data);
			const { subject, html } = templates.bookingContactInfo(validated, locale);

			await this.send({
				to: validated.instructorEmail,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `📞 Contact Info Unlocked\n- Instructor: ${validated.instructorName}\n- Client: ${validated.clientName}\n- Email: ${validated.clientEmail}\n- Phone: ${validated.clientCountryCode} ${validated.clientPhone}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send contact info to instructor:', error);
			throw error;
		}
	}

	/**
	 * Send cancellation notification to instructor
	 */
	async sendCancellationNotificationToInstructor(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.bookingCancellationInstructorSchema.parse(data);
			const { subject, html } = templates.bookingCancellationInstructor(validated, locale);

			await this.send({
				to: validated.instructorEmail,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `❌ Booking Cancelled\n- Instructor: ${validated.instructorName}\n- Client: ${validated.clientName}\n- Booking ID: #${validated.bookingRequestId}\n- Dates: ${validated.startDate}${validated.endDate ? ' - ' + validated.endDate : ''}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send cancellation notification to instructor:', error);
			throw error;
		}
	}

	/**
	 * Send cancellation confirmation to client
	 */
	async sendCancellationConfirmationToClient(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.bookingCancellationClientSchema.parse(data);
			const { subject, html } = templates.bookingCancellationClient(validated, locale);

			await this.send({
				to: validated.clientEmail,
				subject,
				html
			});
		} catch (error) {
			console.error('[EmailService] Failed to send cancellation confirmation to client:', error);
			throw error;
		}
	}

	/**
	 * Send instructor invitation from school
	 */
	async sendInstructorInvitation(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.schoolInstructorInvitationSchema.parse(data);
			const { subject, html } = templates.schoolInstructorInvitation(validated, locale);

			await this.send({
				to: validated.instructorEmail,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `🏫 School Invitation\n- School: ${validated.schoolName}\n- Instructor: ${validated.instructorName}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send instructor invitation:', error);
			throw error;
		}
	}

	/**
	 * Send school application notification to school admin
	 */
	async sendSchoolApplication(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.schoolApplicationSchema.parse(data);
			const { subject, html } = templates.schoolApplication(validated, locale);

			await this.send({
				to: validated.schoolAdminEmail,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `📝 New School Application\n- School: ${validated.schoolName}\n- Instructor: ${validated.instructorName}\n- Instructor ID: #${validated.instructorId}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send school application:', error);
			throw error;
		}
	}

	/**
	 * Send instructor accepted notification
	 */
	async sendInstructorAccepted(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.schoolInstructorAcceptedSchema.parse(data);
			const { subject, html } = templates.schoolInstructorAccepted(validated, locale);

			await this.send({
				to: validated.instructorEmail,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `🎉 Instructor Accepted\n- School: ${validated.schoolName}\n- Instructor: ${validated.instructorName}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send instructor accepted notification:', error);
			throw error;
		}
	}

	/**
	 * Send instructor rejected notification
	 */
	async sendInstructorRejected(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.schoolInstructorRejectedSchema.parse(data);
			const { subject, html } = templates.schoolInstructorRejected(validated, locale);

			await this.send({
				to: validated.instructorEmail,
				subject,
				html
			});
		} catch (error) {
			console.error('[EmailService] Failed to send instructor rejected notification:', error);
			throw error;
		}
	}

	/**
	 * Send invitation accepted notification to school admin
	 */
	async sendInvitationAccepted(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.schoolInvitationAcceptedSchema.parse(data);
			const { subject, html } = templates.schoolInvitationAccepted(validated, locale);

			await this.send({
				to: validated.schoolAdminEmail,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `🎉 Invitation Accepted\n- School: ${validated.schoolName}\n- Instructor: ${validated.instructorName}\n- Instructor ID: #${validated.instructorId}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send invitation accepted notification:', error);
			throw error;
		}
	}

	/**
	 * Send instructor deactivated notification
	 */
	async sendInstructorDeactivated(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.schoolInstructorDeactivatedSchema.parse(data);
			const { subject, html } = templates.schoolInstructorDeactivated(validated, locale);

			await this.send({
				to: validated.instructorEmail,
				subject,
				html
			});
		} catch (error) {
			console.error('[EmailService] Failed to send instructor deactivated notification:', error);
			throw error;
		}
	}

	/**
	 * Send contact form notification to instructor
	 */
	async sendInstructorContactForm(data: unknown, locale?: Locale): Promise<void> {
		try {
			const validated = schemas.instructorContactFormSchema.parse(data);
			const { subject, html } = templates.instructorContactForm(validated, locale);

			await this.send({
				to: validated.instructorEmail,
				subject,
				html,
				sendTelegram: true,
				telegramMessage: `💬 New Contact Form Message\n- Instructor: ${validated.instructorName}\n- From: ${validated.clientName}\n- Email: ${validated.clientEmail}\n- Message: ${validated.message.substring(0, 100)}${validated.message.length > 100 ? '...' : ''}`
			});
		} catch (error) {
			console.error('[EmailService] Failed to send instructor contact form:', error);
			throw error;
		}
	}
}

/**
 * Singleton instance of EmailService
 */
export const emailService = new EmailService();
