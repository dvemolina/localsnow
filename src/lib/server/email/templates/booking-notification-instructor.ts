/**
 * New booking notification sent to instructor
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
import type { BookingNotificationInstructorData } from '../schemas';

export const bookingNotificationInstructor: EmailTemplate<BookingNotificationInstructorData> = (
	data,
	locale = 'en'
) => {
	const subject = `New Booking Request #${data.bookingRequestId} from ${data.clientName}`;

	// Format dates
	const startDate = data.startDate;
	const dateRange = data.endDate ? `${startDate} - ${data.endDate}` : startDate;

	// Build details
	const details = [
		{ label: 'Booking ID', value: `#${data.bookingRequestId}`, highlight: true },
		{ label: 'Client Name', value: data.clientName },
		{ label: 'Dates', value: dateRange },
		{ label: 'Number of Students', value: data.numberOfStudents },
		{ label: 'Hours per Day', value: data.hoursPerDay }
	];

	if (data.estimatedPrice && data.currency) {
		details.push({
			label: 'Estimated Price',
			value: `${data.estimatedPrice} ${data.currency}`,
			highlight: true
		});
	}

	const dashboardUrl = data.dashboardUrl || 'https://localsnow.org/dashboard/bookings';

	const content = `
		${header({
			emoji: '📅',
			text: 'New Booking Request',
			backgroundColor: '#10b981'
		})}

		${contentSection(`
			${heading(`Hi ${data.instructorName}! 👋`)}

			${paragraph(`You've received a new booking request! A client is interested in booking lessons with you.`)}

			${alert(
				`<strong>Action Required:</strong> Please review this booking request in your dashboard and respond as soon as possible.`,
				'info'
			)}

			${heading('Booking Details')}

			${detailsTable(details)}

			${heading('Next Steps')}

			${paragraph(`
				1. <strong>Review the details</strong> in your dashboard<br>
				2. <strong>Check your availability</strong> for the requested dates<br>
				3. <strong>Accept or decline</strong> the booking request<br>
				4. <strong>Contact the client</strong> to confirm details
			`)}
		`)}

		${actionButtons([
			{
				label: 'View Booking',
				url: dashboardUrl
			}
		])}

		${contentSection(`
			${paragraph(`The client is waiting for your response. We recommend replying within 24 hours to maintain a good response rate.`)}

			${paragraph(`Best regards,<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `New booking request from ${data.clientName} - View details now`
		})
	};
};
