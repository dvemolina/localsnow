/**
 * Contact info email sent to instructor with full client details
 * This is sent when the instructor unlocks the contact information
 */

import { wrapEmail, baseStyles } from '../base';
import {
	header,
	contentSection,
	paragraph,
	heading,
	detailsTable,
	infoBox,
	messageBox
} from '../components';
import type { EmailTemplate, Locale } from '../types';
import type { BookingContactInfoData } from '../schemas';

export const bookingContactInfo: EmailTemplate<BookingContactInfoData> = (data, locale = 'en') => {
	const subject = `Contact Information for ${data.clientName}`;

	// Format dates
	const startDate = data.startDate;
	const dateRange = data.endDate ? `${startDate} - ${data.endDate}` : startDate;

	// Build lesson details
	const lessonDetails = [
		{ label: 'Dates', value: dateRange },
		{ label: 'Number of Students', value: data.numberOfStudents },
		{ label: 'Hours per Day', value: data.hoursPerDay },
		{ label: 'Sport(s)', value: data.sports.join(', ') },
		{ label: 'Skill Level', value: data.skillLevel }
	];

	if (data.estimatedPrice && data.currency) {
		lessonDetails.push({
			label: 'Estimated Price',
			value: `${data.estimatedPrice} ${data.currency}`
		});
	}

	// Build contact details
	const contactDetails = [
		{ label: 'Name', value: data.clientName, highlight: true },
		{ label: 'Email', value: `<a href="mailto:${data.clientEmail}" style="color: ${baseStyles.primary}; text-decoration: none;">${data.clientEmail}</a>`, highlight: true },
		{
			label: 'Phone',
			value: `<a href="tel:${data.clientCountryCode}${data.clientPhone}" style="color: ${baseStyles.primary}; text-decoration: none;">${data.clientCountryCode} ${data.clientPhone}</a>`,
			highlight: true
		}
	];

	const content = `
		${header({
			emoji: '📞',
			text: 'Client Contact Information',
			backgroundColor: '#2563eb'
		})}

		${contentSection(`
			${heading(`Hi ${data.instructorName}! 👋`)}

			${paragraph(`Here are the full contact details for <strong>${data.clientName}</strong>. You can now reach out directly to finalize the booking details.`)}

			${infoBox({
				title: '👤 Contact Information',
				content: detailsTable(contactDetails),
				borderColor: baseStyles.primary,
				backgroundColor: '#eff6ff'
			})}

			${heading('Lesson Details')}

			${detailsTable(lessonDetails)}

			${data.message ? `${heading('Client Message')}${messageBox(data.message)}` : ''}

			${heading('Next Steps')}

			${paragraph(`
				1. <strong>Reach out to the client</strong> via email or phone<br>
				2. <strong>Confirm the lesson details</strong> and answer any questions<br>
				3. <strong>Arrange meeting point</strong> and any special requirements<br>
				4. <strong>Send confirmation</strong> with final details
			`)}

			${paragraph(`
				<strong>Tip:</strong> Respond promptly to provide excellent service and build trust with your clients.
			`)}
		`)}

		${contentSection(`
			${paragraph(`Best of luck with the lesson! 🎿<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `Contact details for ${data.clientName}`
		})
	};
};
