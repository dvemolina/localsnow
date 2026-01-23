/**
 * Contact form notification sent to instructor when someone uses contact form
 */

import { wrapEmail, baseStyles } from '../base';
import {
	header,
	contentSection,
	paragraph,
	heading,
	detailsTable,
	messageBox,
	actionButtons,
	infoBox
} from '../components';
import type { EmailTemplate, Locale } from '../types';
import type { InstructorContactFormData } from '../schemas';

export const instructorContactForm: EmailTemplate<InstructorContactFormData> = (
	data,
	locale = 'en'
) => {
	const subject = `New Message from ${data.clientName}`;

	// Build contact details
	const contactDetails = [
		{ label: 'Name', value: data.clientName, highlight: true },
		{
			label: 'Email',
			value: `<a href="mailto:${data.clientEmail}" style="color: ${baseStyles.primary}; text-decoration: none;">${data.clientEmail}</a>`,
			highlight: true
		}
	];

	if (data.clientPhone) {
		contactDetails.push({
			label: 'Phone',
			value: `<a href="tel:${data.clientPhone}" style="color: ${baseStyles.primary}; text-decoration: none;">${data.clientPhone}</a>`,
			highlight: true
		});
	}

	const content = `
		${header({
			emoji: '💬',
			text: 'New Contact Form Message',
			backgroundColor: '#06b6d4'
		})}

		${contentSection(`
			${heading(`Hi ${data.instructorName}! 👋`)}

			${paragraph(`You've received a new message through your instructor profile on Local Snow.`)}

			${infoBox({
				title: '👤 Contact Information',
				content: detailsTable(contactDetails),
				borderColor: baseStyles.info,
				backgroundColor: '#ecfeff'
			})}

			${heading('Their Message')}

			${messageBox(data.message)}

			${heading('Next Steps')}

			${paragraph(`
				1. <strong>Review the message</strong> and assess the inquiry<br>
				2. <strong>Respond promptly</strong> via email${data.clientPhone ? ' or phone' : ''}<br>
				3. <strong>Answer questions</strong> about your services and availability<br>
				4. <strong>Guide them</strong> through the booking process if interested
			`)}

			${paragraph(`
				<strong>Tip:</strong> Quick responses lead to more bookings! Try to reply within a few hours to show professionalism.
			`)}
		`)}

		${actionButtons([
			{
				label: `Reply to ${data.clientName}`,
				url: `mailto:${data.clientEmail}?subject=Re: Your inquiry on Local Snow`,
				backgroundColor: '#06b6d4'
			},
			{
				label: 'View My Profile',
				url: data.instructorProfileUrl,
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`This is a great opportunity to connect with a potential client. Best of luck with the conversation!`)}

			${paragraph(`Best regards,<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `${data.clientName} sent you a message: ${data.message.substring(0, 100)}...`
		})
	};
};
