/**
 * Cancellation confirmation sent to client after they cancel a booking
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
import type { BookingCancellationClientData } from '../schemas';

export const bookingCancellationClient: EmailTemplate<BookingCancellationClientData> = (
	data,
	locale = 'en'
) => {
	const subject = `Booking Cancelled - ${data.instructorName}`;

	// Format dates
	const startDate = data.startDate;
	const dateRange = data.endDate ? `${startDate} - ${data.endDate}` : startDate;

	// Build details
	const details = [
		{ label: 'Booking ID', value: `#${data.bookingRequestId}` },
		{ label: 'Instructor', value: data.instructorName },
		{ label: 'Dates', value: dateRange }
	];

	const content = `
		${header({
			emoji: '✓',
			text: 'Booking Cancelled',
			backgroundColor: '#6b7280'
		})}

		${contentSection(`
			${heading(`Hi ${data.clientName},`)}

			${paragraph(`Your booking with <strong>${data.instructorName}</strong> has been successfully cancelled.`)}

			${alert(
				`The instructor has been notified of the cancellation. No further action is required from you.`,
				'info'
			)}

			${heading('Cancelled Booking Details')}

			${detailsTable(details)}

			${heading('What\'s Next?')}

			${paragraph(`
				• <strong>Browse other instructors</strong> if you'd like to book someone else<br>
				• <strong>Reschedule later</strong> when your plans are confirmed<br>
				• <strong>Contact support</strong> if you have any questions
			`)}
		`)}

		${actionButtons([
			{
				label: 'Browse Instructors',
				url: 'https://localsnow.org/instructors'
			},
			{
				label: 'My Dashboard',
				url: 'https://localsnow.org/dashboard',
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`We hope to help you find the perfect instructor for your next snow sports adventure!`)}

			${paragraph(`Best regards,<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: 'Your booking has been cancelled successfully'
		})
	};
};
