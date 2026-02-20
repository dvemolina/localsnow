import { emailService } from '$lib/server/email/service';

export async function sendSignupEmail(name: string, email: string) {
	try {
		await emailService.sendSignupEmail({
			name,
			email
		});
	} catch (err) {
		console.error('Error sending signup email:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendBookingNotificationToInstructor(data: {
	instructorEmail: string;
	instructorName: string;
	bookingRequestId: number;
	clientName: string;
	numberOfStudents: number;
	startDate: string;
	endDate?: string;
	hoursPerDay: number;
	estimatedPrice?: number;
	currency?: string;
	dashboardUrl?: string;
}) {
	try {
		await emailService.sendBookingNotificationToInstructor({
			...data,
			dashboardUrl: data.dashboardUrl || 'https://localsnow.org/dashboard'
		});
	} catch (err) {
		console.error('Error sending instructor notification:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendBookingConfirmationToClient(data: {
	clientEmail: string;
	clientName: string;
	instructorName: string;
	numberOfStudents: number;
	startDate: string;
	endDate?: string;
	hoursPerDay: number;
	estimatedPrice?: number;
	currency?: string;
}) {
	try {
		await emailService.sendBookingConfirmationToClient(data);
	} catch (err) {
		console.error('Error sending client confirmation:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendContactInfoToInstructor(data: {
	instructorEmail: string;
	instructorName: string;
	clientName: string;
	clientEmail: string;
	clientPhone: string;
	clientCountryCode: string;
	numberOfStudents: number;
	startDate: string;
	endDate?: string;
	hoursPerDay: number;
	sports: string[];
	skillLevel: string;
	message?: string;
	estimatedPrice?: number;
	currency?: string;
}) {
	try {
		await emailService.sendContactInfoToInstructor(data);
	} catch (err) {
		console.error('Error sending contact info:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendCancellationNotificationToInstructor(data: {
	instructorEmail: string;
	instructorName: string;
	bookingRequestId: number;
	clientName: string;
	startDate: string;
	endDate?: string;
	numberOfStudents: number;
	hoursPerDay: number;
	dashboardUrl?: string;
}) {
	try {
		await emailService.sendCancellationNotificationToInstructor({
			...data,
			dashboardUrl: data.dashboardUrl || 'https://localsnow.org/dashboard/bookings'
		});
	} catch (err) {
		console.error('Error sending cancellation notification:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendCancellationConfirmationToClient(data: {
	clientEmail: string;
	clientName: string;
	instructorName: string;
	bookingRequestId: number;
	startDate: string;
	endDate?: string;
}) {
	try {
		await emailService.sendCancellationConfirmationToClient(data);
	} catch (err) {
		console.error('Error sending cancellation confirmation:', err);
		// Don't throw - graceful degradation
	}
}

// School Management Email Notifications

export async function sendInstructorInvitation(data: {
	instructorEmail: string;
	instructorName: string;
	schoolName: string;
	schoolSlug: string;
	invitationUrl: string;
}) {
	try {
		await emailService.sendInstructorInvitation(data);
	} catch (err) {
		console.error('Error sending instructor invitation:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendSchoolApplication(data: {
	schoolAdminEmail: string;
	schoolName: string;
	instructorName: string;
	instructorId: number;
	reviewUrl: string;
}) {
	try {
		await emailService.sendSchoolApplication(data);
	} catch (err) {
		console.error('Error sending school application notification:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendInstructorAccepted(data: {
	instructorEmail: string;
	instructorName: string;
	schoolName: string;
	schoolSlug: string;
	dashboardUrl: string;
}) {
	try {
		await emailService.sendInstructorAccepted(data);
	} catch (err) {
		console.error('Error sending instructor accepted notification:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendInstructorRejected(data: {
	instructorEmail: string;
	instructorName: string;
	schoolName: string;
}) {
	try {
		await emailService.sendInstructorRejected(data);
	} catch (err) {
		console.error('Error sending instructor rejected notification:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendInvitationAccepted(data: {
	schoolAdminEmail: string;
	schoolName: string;
	instructorName: string;
	instructorId: number;
}) {
	try {
		await emailService.sendInvitationAccepted(data);
	} catch (err) {
		console.error('Error sending invitation accepted notification:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendInstructorDeactivated(data: {
	instructorEmail: string;
	instructorName: string;
	schoolName: string;
}) {
	try {
		await emailService.sendInstructorDeactivated(data);
	} catch (err) {
		console.error('Error sending instructor deactivated notification:', err);
		// Don't throw - graceful degradation
	}
}

// Instructor Verification Email Notifications

export async function sendInstructorVerifiedEmail(data: {
	instructorEmail: string;
	instructorName: string;
	dashboardUrl?: string;
}) {
	try {
		await emailService.sendInstructorVerified({
			...data,
			dashboardUrl: data.dashboardUrl || 'https://localsnow.org/dashboard'
		});
	} catch (err) {
		console.error('Error sending instructor verified email:', err);
		// Don't throw - graceful degradation
	}
}

export async function sendInstructorVerificationRejectedEmail(data: {
	instructorEmail: string;
	instructorName: string;
	reason: string;
	dashboardUrl?: string;
}) {
	try {
		await emailService.sendInstructorVerificationRejected({
			...data,
			dashboardUrl: data.dashboardUrl || 'https://localsnow.org/dashboard/profile'
		});
	} catch (err) {
		console.error('Error sending instructor verification rejected email:', err);
		// Don't throw - graceful degradation
	}
}

// Instructor Contact Form Email Notification

export async function sendInstructorContactForm(data: {
	instructorEmail: string;
	instructorName: string;
	clientName: string;
	clientEmail: string;
	clientPhone?: string;
	message: string;
	instructorProfileUrl: string;
}) {
	try {
		await emailService.sendInstructorContactForm(data);
	} catch (err) {
		console.error('Error sending instructor contact form notification:', err);
		// Don't throw - graceful degradation
	}
}
