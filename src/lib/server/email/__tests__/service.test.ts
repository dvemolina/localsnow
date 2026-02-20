/**
 * Tests for email service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '../service';
import * as sender from '../sender';

// Mock the sender module
vi.mock('../sender', () => ({
	sendViaWebhook: vi.fn()
}));

describe('EmailService', () => {
	let emailService: EmailService;

	beforeEach(() => {
		emailService = new EmailService();
		vi.clearAllMocks();
	});

	describe('sendSignupEmail', () => {
		it('should validate data with Zod schema', async () => {
			const validData = {
				name: 'John',
				email: 'john@example.com'
			};

			await emailService.sendSignupEmail(validData);

			expect(sender.sendViaWebhook).toHaveBeenCalledOnce();
			expect(sender.sendViaWebhook).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'john@example.com',
					subject: expect.stringContaining('Welcome'),
					html: expect.any(String),
					sendTelegram: true,
					telegramMessage: expect.stringContaining('John')
				})
			);
		});

		it('should reject invalid email', async () => {
			const invalidData = {
				name: 'John',
				email: 'not-an-email'
			};

			await expect(emailService.sendSignupEmail(invalidData)).rejects.toThrow();
			expect(sender.sendViaWebhook).not.toHaveBeenCalled();
		});

		it('should reject missing required fields', async () => {
			const invalidData = {
				email: 'john@example.com'
				// Missing name
			};

			await expect(emailService.sendSignupEmail(invalidData)).rejects.toThrow();
			expect(sender.sendViaWebhook).not.toHaveBeenCalled();
		});
	});

	describe('sendBookingNotificationToInstructor', () => {
		it('should send email with correct data', async () => {
			const validData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				bookingRequestId: 123,
				clientName: 'Mike',
				numberOfStudents: 2,
				startDate: '2025-02-15',
				hoursPerDay: 4
			};

			await emailService.sendBookingNotificationToInstructor(validData);

			expect(sender.sendViaWebhook).toHaveBeenCalledOnce();
			expect(sender.sendViaWebhook).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'instructor@example.com',
					subject: expect.stringContaining('Booking Request'),
					sendTelegram: true
				})
			);
		});

		it('should include Telegram notification', async () => {
			const validData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				bookingRequestId: 123,
				clientName: 'Mike',
				numberOfStudents: 2,
				startDate: '2025-02-15',
				hoursPerDay: 4
			};

			await emailService.sendBookingNotificationToInstructor(validData);

			const call = vi.mocked(sender.sendViaWebhook).mock.calls[0][0];
			expect(call.sendTelegram).toBe(true);
			expect(call.telegramMessage).toContain('Booking Request');
			expect(call.telegramMessage).toContain('Sarah');
			expect(call.telegramMessage).toContain('Mike');
		});
	});

	describe('sendBookingConfirmationToClient', () => {
		it('should not send Telegram notification', async () => {
			const validData = {
				clientEmail: 'client@example.com',
				clientName: 'Mike',
				instructorName: 'Sarah',
				numberOfStudents: 2,
				startDate: '2025-02-15',
				hoursPerDay: 4
			};

			await emailService.sendBookingConfirmationToClient(validData);

			const call = vi.mocked(sender.sendViaWebhook).mock.calls[0][0];
			expect(call.sendTelegram).toBeUndefined();
		});
	});

	describe('sendInstructorContactForm', () => {
		it('should handle optional phone field', async () => {
			const dataWithoutPhone = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				clientName: 'Mike',
				clientEmail: 'mike@example.com',
				message: 'Hello!',
				instructorProfileUrl: 'https://localsnow.org/instructors/42'
			};

			await emailService.sendInstructorContactForm(dataWithoutPhone);

			expect(sender.sendViaWebhook).toHaveBeenCalledOnce();
		});

		it('should include Telegram notification with message preview', async () => {
			const validData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				clientName: 'Mike',
				clientEmail: 'mike@example.com',
				message:
					'This is a long message that should be truncated in the Telegram notification because it exceeds the length limit we want for notifications',
				instructorProfileUrl: 'https://localsnow.org/instructors/42'
			};

			await emailService.sendInstructorContactForm(validData);

			const call = vi.mocked(sender.sendViaWebhook).mock.calls[0][0];
			expect(call.sendTelegram).toBe(true);
			expect(call.telegramMessage).toBeTruthy();
		});
	});

	describe('Error handling', () => {
		it('should throw on invalid email address', async () => {
			const invalidData = {
				name: 'John',
				email: 'invalid-email'
			};

			await expect(emailService.sendSignupEmail(invalidData)).rejects.toThrow();
		});

		it('should throw on schema validation failure', async () => {
			const invalidData = {
				// Missing required fields
				email: 'test@example.com'
			};

			await expect(emailService.sendSignupEmail(invalidData)).rejects.toThrow();
		});
	});
});
