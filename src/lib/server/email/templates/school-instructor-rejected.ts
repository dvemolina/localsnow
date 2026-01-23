/**
 * Notification sent to instructor when school rejects their application
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
import type { SchoolInstructorRejectedData } from '../schemas';

export const schoolInstructorRejected: EmailTemplate<SchoolInstructorRejectedData> = (
	data,
	locale = 'en'
) => {
	const subject = `Application Update from ${data.schoolName}`;

	const content = `
		${header({
			emoji: '📋',
			text: 'Application Update',
			backgroundColor: '#6b7280'
		})}

		${contentSection(`
			${heading(`Hi ${data.instructorName},`)}

			${paragraph(`Thank you for your interest in joining <strong>${data.schoolName}</strong>.`)}

			${paragraph(`After careful consideration, the school has decided not to move forward with your application at this time.`)}

			${alert(
				`<strong>This doesn't reflect on your abilities as an instructor.</strong><br><br>
				Schools make decisions based on various factors including current team size, specializations, and scheduling needs. We encourage you to continue your independent instructor work on Local Snow!`,
				'info'
			)}

			${heading('What You Can Do')}

			${paragraph(`
				• <strong>Continue as an independent instructor</strong> on Local Snow<br>
				• <strong>Apply to other schools</strong> that match your expertise<br>
				• <strong>Build your profile</strong> and attract direct bookings<br>
				• <strong>Collect reviews</strong> to strengthen your reputation
			`)}
		`)}

		${actionButtons([
			{
				label: 'Browse Other Schools',
				url: 'https://localsnow.org/schools',
				backgroundColor: '#6b7280'
			},
			{
				label: 'My Dashboard',
				url: 'https://localsnow.org/dashboard',
				backgroundColor: '#9ca3af'
			}
		])}

		${contentSection(`
			${paragraph(`There are many opportunities on Local Snow, and we're here to support you in building a successful instructor career.`)}

			${paragraph(`Best of luck! 🎿<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `Update on your application to ${data.schoolName}`
		})
	};
};
