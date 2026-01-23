/**
 * Cancellation notification sent to instructor when client cancels booking
 */

import { wrapEmail } from '../base';
import {
	header,
	contentSection,
	paragraph,
	heading,
	detailsTable,
	actionButtons,
	alert
} from '../components';
import type { EmailTemplate, Locale } from '../types';
import type { BookingCancellationInstructorData } from '../schemas';

export const bookingCancellationInstructor: EmailTemplate<BookingCancellationInstructorData> = (
	data,
	locale = 'en'
) => {
	const subject = `Booking Cancelled - ${data.clientName} (Booking #${data.bookingRequestId})`;

	// Format dates
	const startDate = data.startDate;
	const dateRange = data.endDate ? `${startDate} - ${data.endDate}` : startDate;

	// Build details
	const details = [
		{ label: 'Booking ID', value: `#${data.bookingRequestId}` },
		{ label: 'Client Name', value: data.clientName },
		{ label: 'Dates', value: dateRange },
		{ label: 'Number of Students', value: data.numberOfStudents },
		{ label: 'Hours per Day', value: data.hoursPerDay }
	];

	const dashboardUrl = data.dashboardUrl || 'https://localsnow.org/dashboard/bookings';

	const content = `
		${header({
			emoji: '❌',
			text: 'Booking Cancelled',
			backgroundColor: '#ef4444'
		})}

		${contentSection(`
			${heading(`Hi ${data.instructorName},`)}

			${paragraph(`This is to inform you that <strong>${data.clientName}</strong> has cancelled their booking request.`)}

			${alert(
				`The time slots for this booking have been automatically released and are now available for other clients to book.`,
				'info'
			)}

			${heading('Cancelled Booking Details')}

			${detailsTable(details)}

			${paragraph(`
				<strong>What This Means:</strong><br>
				• Your schedule is now open for these time slots<br>
				• No further action is required from you<br>
				• The booking has been marked as cancelled in your dashboard
			`)}
		`)}

		${actionButtons([
			{
				label: 'View Dashboard',
				url: dashboardUrl,
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`We appreciate your flexibility. We'll continue working to connect you with clients who are excited to learn from you!`)}

			${paragraph(`Best regards,<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `Booking #${data.bookingRequestId} has been cancelled by ${data.clientName}`
		})
	};
};
