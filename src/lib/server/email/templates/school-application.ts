/**
 * Notification sent to school admin when an instructor applies to join
 */

import { wrapEmail } from '../base';
import {
	header,
	contentSection,
	paragraph,
	heading,
	actionButtons,
	alert,
	detailsTable
} from '../components';
import type { EmailTemplate, Locale } from '../types';
import type { SchoolApplicationData } from '../schemas';

export const schoolApplication: EmailTemplate<SchoolApplicationData> = (data, locale = 'en') => {
	const subject = `New Instructor Application - ${data.instructorName}`;

	const details = [
		{ label: 'Instructor Name', value: data.instructorName, highlight: true },
		{ label: 'Instructor ID', value: `#${data.instructorId}` }
	];

	const content = `
		${header({
			emoji: '📝',
			text: 'New Application',
			backgroundColor: '#8b5cf6'
		})}

		${contentSection(`
			${heading(`Hi ${data.schoolName} Team! 👋`)}

			${paragraph(`Great news! <strong>${data.instructorName}</strong> has applied to join your school.`)}

			${alert(
				`<strong>Action Required:</strong> Please review this application and decide whether to accept or reject the instructor.`,
				'info'
			)}

			${heading('Application Details')}

			${detailsTable(details)}

			${heading('Next Steps')}

			${paragraph(`
				1. <strong>Review the instructor's profile</strong> and credentials<br>
				2. <strong>Check their experience</strong> and qualifications<br>
				3. <strong>Accept or decline</strong> the application<br>
				4. <strong>Reach out</strong> to the instructor if you have questions
			`)}

			${paragraph(`
				<strong>Tip:</strong> Review applications promptly to show professionalism and build a strong team of instructors.
			`)}
		`)}

		${actionButtons([
			{
				label: 'Review Application',
				url: data.reviewUrl,
				backgroundColor: '#8b5cf6'
			},
			{
				label: 'View Instructor Profile',
				url: `https://localsnow.org/instructors/${data.instructorId}`,
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`We recommend responding within 48 hours to maintain a good reputation and attract quality instructors.`)}

			${paragraph(`Best regards,<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `${data.instructorName} has applied to join ${data.schoolName}`
		})
	};
};
