/**
 * Notification sent to instructor when school deactivates them
 */

import { wrapEmail } from '../base';
import {
	header,
	contentSection,
	paragraph,
	heading,
	actionButtons,
	alert
} from '../components';
import type { EmailTemplate, Locale } from '../types';
import type { SchoolInstructorDeactivatedData } from '../schemas';

export const schoolInstructorDeactivated: EmailTemplate<SchoolInstructorDeactivatedData> = (
	data,
	locale = 'en'
) => {
	const subject = `Your Status at ${data.schoolName} Has Changed`;

	const content = `
		${header({
			emoji: '📋',
			text: 'Status Update',
			backgroundColor: '#6b7280'
		})}

		${contentSection(`
			${heading(`Hi ${data.instructorName},`)}

			${paragraph(`We're writing to inform you that your status at <strong>${data.schoolName}</strong> has been changed to inactive.`)}

			${alert(
				`<strong>What This Means:</strong><br><br>
				You are no longer listed as an active instructor with ${data.schoolName}. Your profile has been returned to independent instructor status.`,
				'info'
			)}

			${heading('Your Options Moving Forward')}

			${paragraph(`
				• <strong>Continue as an independent instructor</strong> on Local Snow<br>
				• <strong>Apply to other schools</strong> if you're interested<br>
				• <strong>Contact ${data.schoolName}</strong> if you have questions about this change<br>
				• <strong>Keep building your profile</strong> and attracting direct bookings
			`)}

			${paragraph(`
				Your instructor profile remains active on Local Snow, and you can continue receiving bookings independently.
			`)}
		`)}

		${actionButtons([
			{
				label: 'View My Profile',
				url: 'https://localsnow.org/dashboard',
				backgroundColor: '#6b7280'
			},
			{
				label: 'Browse Schools',
				url: 'https://localsnow.org/schools',
				backgroundColor: '#9ca3af'
			}
		])}

		${contentSection(`
			${paragraph(`If you believe this was done in error or have questions, please reach out to ${data.schoolName} directly or contact our support team.`)}

			${paragraph(`Best regards,<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `Status update from ${data.schoolName}`
		})
	};
};
