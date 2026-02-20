/**
 * Email preview page - Development only
 * Allows viewing all email templates with sample data
 */

import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import * as templates from '$lib/server/email/templates';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Only available in development
	if (!dev) {
		throw error(404, 'Not found');
	}

	// Sample data for each email type
	const sampleData = {
		signupWelcome: {
			name: 'John',
			email: 'john@example.com'
		},
		bookingNotificationInstructor: {
			instructorEmail: 'instructor@example.com',
			instructorName: 'Sarah Johnson',
			bookingRequestId: 12345,
			clientName: 'Mike Smith',
			numberOfStudents: 2,
			startDate: '2025-02-15',
			endDate: '2025-02-17',
			hoursPerDay: 4,
			estimatedPrice: 320,
			currency: 'EUR',
			dashboardUrl: 'https://localsnow.org/dashboard/bookings'
		},
		bookingConfirmationClient: {
			clientEmail: 'client@example.com',
			clientName: 'Mike Smith',
			instructorName: 'Sarah Johnson',
			numberOfStudents: 2,
			startDate: '2025-02-15',
			endDate: '2025-02-17',
			hoursPerDay: 4,
			estimatedPrice: 320,
			currency: 'EUR'
		},
		bookingContactInfo: {
			instructorEmail: 'instructor@example.com',
			instructorName: 'Sarah Johnson',
			clientName: 'Mike Smith',
			clientEmail: 'mike@example.com',
			clientPhone: '1234567890',
			clientCountryCode: '+1',
			numberOfStudents: 2,
			startDate: '2025-02-15',
			endDate: '2025-02-17',
			hoursPerDay: 4,
			sports: ['Skiing', 'Snowboarding'],
			skillLevel: 'Intermediate',
			message:
				'Looking forward to learning from an expert! We have some basic experience but want to improve our technique.',
			estimatedPrice: 320,
			currency: 'EUR'
		},
		bookingCancellationInstructor: {
			instructorEmail: 'instructor@example.com',
			instructorName: 'Sarah Johnson',
			bookingRequestId: 12345,
			clientName: 'Mike Smith',
			startDate: '2025-02-15',
			endDate: '2025-02-17',
			numberOfStudents: 2,
			hoursPerDay: 4,
			dashboardUrl: 'https://localsnow.org/dashboard/bookings'
		},
		bookingCancellationClient: {
			clientEmail: 'client@example.com',
			clientName: 'Mike Smith',
			instructorName: 'Sarah Johnson',
			bookingRequestId: 12345,
			startDate: '2025-02-15',
			endDate: '2025-02-17'
		},
		schoolInstructorInvitation: {
			instructorEmail: 'instructor@example.com',
			instructorName: 'Sarah Johnson',
			schoolName: 'Alpine Snow School',
			schoolSlug: 'alpine-snow-school',
			invitationUrl: 'https://localsnow.org/dashboard/invitations'
		},
		schoolApplication: {
			schoolAdminEmail: 'admin@alpineschool.com',
			schoolName: 'Alpine Snow School',
			instructorName: 'Sarah Johnson',
			instructorId: 42,
			reviewUrl: 'https://localsnow.org/dashboard/school/instructors/pending'
		},
		schoolInstructorAccepted: {
			instructorEmail: 'instructor@example.com',
			instructorName: 'Sarah Johnson',
			schoolName: 'Alpine Snow School',
			schoolSlug: 'alpine-snow-school',
			dashboardUrl: 'https://localsnow.org/dashboard'
		},
		schoolInstructorRejected: {
			instructorEmail: 'instructor@example.com',
			instructorName: 'Sarah Johnson',
			schoolName: 'Alpine Snow School'
		},
		schoolInvitationAccepted: {
			schoolAdminEmail: 'admin@alpineschool.com',
			schoolName: 'Alpine Snow School',
			instructorName: 'Sarah Johnson',
			instructorId: 42
		},
		schoolInstructorDeactivated: {
			instructorEmail: 'instructor@example.com',
			instructorName: 'Sarah Johnson',
			schoolName: 'Alpine Snow School'
		},
		instructorContactForm: {
			instructorEmail: 'instructor@example.com',
			instructorName: 'Sarah Johnson',
			clientName: 'Mike Smith',
			clientEmail: 'mike@example.com',
			clientPhone: '+1-555-1234',
			message:
				"Hi! I'm interested in booking ski lessons for my family. We're beginners and would love to learn the basics. What are your available dates in February?",
			instructorProfileUrl: 'https://localsnow.org/instructors/42'
		}
	};

	// Generate previews for all templates
	const emailPreviews = [
		{
			id: 'signup-welcome',
			name: 'Welcome Email (Signup)',
			...templates.signupWelcome(sampleData.signupWelcome)
		},
		{
			id: 'booking-notification-instructor',
			name: 'Booking Notification (Instructor)',
			...templates.bookingNotificationInstructor(sampleData.bookingNotificationInstructor)
		},
		{
			id: 'booking-confirmation-client',
			name: 'Booking Confirmation (Client)',
			...templates.bookingConfirmationClient(sampleData.bookingConfirmationClient)
		},
		{
			id: 'booking-contact-info',
			name: 'Contact Info (Instructor)',
			...templates.bookingContactInfo(sampleData.bookingContactInfo)
		},
		{
			id: 'booking-cancellation-instructor',
			name: 'Cancellation Notification (Instructor)',
			...templates.bookingCancellationInstructor(sampleData.bookingCancellationInstructor)
		},
		{
			id: 'booking-cancellation-client',
			name: 'Cancellation Confirmation (Client)',
			...templates.bookingCancellationClient(sampleData.bookingCancellationClient)
		},
		{
			id: 'school-instructor-invitation',
			name: 'School Invitation (Instructor)',
			...templates.schoolInstructorInvitation(sampleData.schoolInstructorInvitation)
		},
		{
			id: 'school-application',
			name: 'School Application (Admin)',
			...templates.schoolApplication(sampleData.schoolApplication)
		},
		{
			id: 'school-instructor-accepted',
			name: 'Application Accepted (Instructor)',
			...templates.schoolInstructorAccepted(sampleData.schoolInstructorAccepted)
		},
		{
			id: 'school-instructor-rejected',
			name: 'Application Rejected (Instructor)',
			...templates.schoolInstructorRejected(sampleData.schoolInstructorRejected)
		},
		{
			id: 'school-invitation-accepted',
			name: 'Invitation Accepted (Admin)',
			...templates.schoolInvitationAccepted(sampleData.schoolInvitationAccepted)
		},
		{
			id: 'school-instructor-deactivated',
			name: 'Instructor Deactivated',
			...templates.schoolInstructorDeactivated(sampleData.schoolInstructorDeactivated)
		},
		{
			id: 'instructor-contact-form',
			name: 'Contact Form Message (Instructor)',
			...templates.instructorContactForm(sampleData.instructorContactForm)
		}
	];

	return {
		emailPreviews
	};
};
