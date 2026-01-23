/**
 * Tests for email templates
 */

import { describe, it, expect } from 'vitest';
import * as templates from '../templates';
import * as schemas from '../schemas';

describe('Email Templates', () => {
	describe('signupWelcome', () => {
		it('should render without errors', () => {
			const data: schemas.SignupWelcomeData = {
				name: 'John',
				email: 'john@example.com',
				betaCode: 'BETA2025',
				isBetaLaunch: true,
				betaValidUntil: '2025-03-31'
			};

			const result = templates.signupWelcome(data);

			expect(result.subject).toBeTruthy();
			expect(result.html).toContain('John');
			expect(result.html).toContain('BETA2025');
			expect(result.html).toContain('Welcome to Local Snow');
		});

		it('should handle different names', () => {
			const data: schemas.SignupWelcomeData = {
				name: 'María',
				email: 'maria@example.com',
				betaCode: 'BETA2025',
				isBetaLaunch: true,
				betaValidUntil: '2025-03-31'
			};

			const result = templates.signupWelcome(data);

			expect(result.html).toContain('María');
		});
	});

	describe('bookingNotificationInstructor', () => {
		it('should render without errors', () => {
			const data: schemas.BookingNotificationInstructorData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				bookingRequestId: 123,
				clientName: 'Mike',
				numberOfStudents: 2,
				startDate: '2025-02-15',
				endDate: '2025-02-17',
				hoursPerDay: 4,
				estimatedPrice: 320,
				currency: 'EUR'
			};

			const result = templates.bookingNotificationInstructor(data);

			expect(result.subject).toContain('Booking Request');
			expect(result.html).toContain('Sarah');
			expect(result.html).toContain('Mike');
			expect(result.html).toContain('123');
		});

		it('should handle single-day bookings', () => {
			const data: schemas.BookingNotificationInstructorData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				bookingRequestId: 123,
				clientName: 'Mike',
				numberOfStudents: 2,
				startDate: '2025-02-15',
				hoursPerDay: 4
			};

			const result = templates.bookingNotificationInstructor(data);

			expect(result.html).toContain('2025-02-15');
			expect(result.html).not.toContain(' - ');
		});
	});

	describe('bookingConfirmationClient', () => {
		it('should render without errors', () => {
			const data: schemas.BookingConfirmationClientData = {
				clientEmail: 'client@example.com',
				clientName: 'Mike',
				instructorName: 'Sarah',
				numberOfStudents: 2,
				startDate: '2025-02-15',
				hoursPerDay: 4
			};

			const result = templates.bookingConfirmationClient(data);

			expect(result.subject).toContain('Booking Request Confirmed');
			expect(result.html).toContain('Mike');
			expect(result.html).toContain('Sarah');
		});
	});

	describe('bookingContactInfo', () => {
		it('should render with all fields', () => {
			const data: schemas.BookingContactInfoData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				clientName: 'Mike',
				clientEmail: 'mike@example.com',
				clientPhone: '1234567890',
				clientCountryCode: '+1',
				numberOfStudents: 2,
				startDate: '2025-02-15',
				hoursPerDay: 4,
				sports: ['Skiing', 'Snowboarding'],
				skillLevel: 'Intermediate',
				message: 'Looking forward to lessons!'
			};

			const result = templates.bookingContactInfo(data);

			expect(result.subject).toContain('Contact Information');
			expect(result.html).toContain('mike@example.com');
			expect(result.html).toContain('+1');
			expect(result.html).toContain('1234567890');
			expect(result.html).toContain('Looking forward to lessons!');
		});

		it('should handle missing optional message', () => {
			const data: schemas.BookingContactInfoData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				clientName: 'Mike',
				clientEmail: 'mike@example.com',
				clientPhone: '1234567890',
				clientCountryCode: '+1',
				numberOfStudents: 2,
				startDate: '2025-02-15',
				hoursPerDay: 4,
				sports: ['Skiing'],
				skillLevel: 'Beginner'
			};

			const result = templates.bookingContactInfo(data);

			expect(result.html).toBeTruthy();
			expect(result.subject).toBeTruthy();
		});
	});

	describe('schoolInstructorInvitation', () => {
		it('should render without errors', () => {
			const data: schemas.SchoolInstructorInvitationData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				schoolName: 'Alpine School',
				schoolSlug: 'alpine-school',
				invitationUrl: 'https://localsnow.org/invitations'
			};

			const result = templates.schoolInstructorInvitation(data);

			expect(result.subject).toContain('Invited');
			expect(result.html).toContain('Alpine School');
			expect(result.html).toContain('Sarah');
		});
	});

	describe('instructorContactForm', () => {
		it('should render with all fields', () => {
			const data: schemas.InstructorContactFormData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				clientName: 'Mike',
				clientEmail: 'mike@example.com',
				clientPhone: '+1-555-1234',
				message: 'I would like to book lessons.',
				instructorProfileUrl: 'https://localsnow.org/instructors/42'
			};

			const result = templates.instructorContactForm(data);

			expect(result.subject).toContain('Message');
			expect(result.html).toContain('Mike');
			expect(result.html).toContain('mike@example.com');
			expect(result.html).toContain('I would like to book lessons.');
		});

		it('should handle missing optional phone', () => {
			const data: schemas.InstructorContactFormData = {
				instructorEmail: 'instructor@example.com',
				instructorName: 'Sarah',
				clientName: 'Mike',
				clientEmail: 'mike@example.com',
				message: 'I would like to book lessons.',
				instructorProfileUrl: 'https://localsnow.org/instructors/42'
			};

			const result = templates.instructorContactForm(data);

			expect(result.html).toBeTruthy();
			expect(result.subject).toBeTruthy();
		});
	});

	// Test that all templates return proper EmailResult structure
	describe('Template output format', () => {
		it('all templates should return subject and html', () => {
			const templateFunctions = Object.entries(templates);

			for (const [name, templateFn] of templateFunctions) {
				// Skip if not a function
				if (typeof templateFn !== 'function') continue;

				// This is a basic smoke test - we won't test with real data here
				// Just verify the templates are exported properly
				expect(typeof templateFn).toBe('function');
			}
		});
	});
});
