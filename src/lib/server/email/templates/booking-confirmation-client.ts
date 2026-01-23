/**
 * Booking confirmation sent to client after creating a booking request
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
import type { BookingConfirmationClientData } from '../schemas';

export const bookingConfirmationClient: EmailTemplate<BookingConfirmationClientData> = (
	data,
	locale = 'en'
) => {
	const subject = `Booking Request Confirmed - ${data.instructorName}`;

	// Format dates
	const startDate = data.startDate;
	const dateRange = data.endDate ? `${startDate} - ${data.endDate}` : startDate;

	// Build details
	const details = [
		{ label: 'Instructor', value: data.instructorName, highlight: true },
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

	const content = `
		${header({
			emoji: '✅',
			text: 'Booking Request Sent!',
			backgroundColor: '#10b981'
		})}

		${contentSection(`
			${heading(`Hi ${data.clientName}! 👋`)}

			${paragraph(`Great news! Your booking request has been successfully sent to ${data.instructorName}.`)}

			${alert(
				`<strong>What's Next?</strong><br><br>
				The instructor will review your request and respond within 24-48 hours. You'll receive an email notification when they respond.`,
				'info'
			)}

			${heading('Your Booking Details')}

			${detailsTable(details)}

			${heading('While You Wait')}

			${paragraph(`
				• <strong>Check your email</strong> for updates from the instructor<br>
				• <strong>Review your dashboard</strong> to track the booking status<br>
				• <strong>Prepare any questions</strong> you'd like to ask the instructor<br>
				• <strong>Gather your equipment</strong> if you have any
			`)}
		`)}

		${actionButtons([
			{
				label: 'View My Bookings',
				url: 'https://localsnow.org/dashboard'
			}
		])}

		${contentSection(`
			${paragraph(`
				If you need to make changes or cancel this booking, you can do so from your dashboard before the instructor responds.
			`)}

			${paragraph(`See you on the slopes! 🎿❄️<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: 'Your booking request has been sent successfully'
		})
	};
};
