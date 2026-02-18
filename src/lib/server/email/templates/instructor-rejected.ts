/**
 * Notification sent to instructor when admin rejects their qualification
 */

import { wrapEmail } from '../base';
import {
	header,
	contentSection,
	paragraph,
	heading,
	actionButtons,
	alert,
	infoBox
} from '../components';
import type { EmailTemplate, Locale } from '../types';
import type { InstructorRejectedData } from '../schemas';

export const instructorRejected: EmailTemplate<InstructorRejectedData> = (
	data,
	locale = 'en'
) => {
	const subject = `Action Needed: Your Verification Requires Updates`;

	const content = `
		${header({
			emoji: '📋',
			text: 'Verification Update',
			backgroundColor: '#f59e0b'
		})}

		${contentSection(`
			${heading(`Hi ${data.instructorName},`)}

			${paragraph(`Thank you for submitting your qualifications for review. After careful consideration, we were unable to verify your profile at this time.`)}

			${alert(
				`<strong>Reason:</strong><br><br>${data.reason}`,
				'warning'
			)}

			${infoBox({
				title: '📄 What You Can Do',
				content: `
					<strong>• Re-upload Documents:</strong> Submit updated or clearer qualification documents<br>
					<strong>• Check Requirements:</strong> Make sure your documents meet our verification criteria<br>
					<strong>• Contact Support:</strong> If you have questions, reach out to our team
				`,
				borderColor: '#f59e0b',
				backgroundColor: '#fffbeb'
			})}

			${paragraph(`Don't worry — you can re-submit your qualifications at any time from your dashboard. We're happy to review them again.`)}
		`)}

		${actionButtons([
			{
				label: 'Re-upload Qualifications',
				url: data.dashboardUrl,
				backgroundColor: '#f59e0b'
			},
			{
				label: 'Contact Support',
				url: 'https://localsnow.org/contact',
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`We want to help you get verified as quickly as possible. If you have any questions about the requirements, don't hesitate to reach out.`)}

			${paragraph(`Best regards, 🎿<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: 'Your verification needs some updates - here\'s what to do next'
		})
	};
};
