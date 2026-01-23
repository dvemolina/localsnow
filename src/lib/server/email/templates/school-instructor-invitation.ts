/**
 * Invitation sent to instructor when a school invites them to join
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
import type { SchoolInstructorInvitationData } from '../schemas';

export const schoolInstructorInvitation: EmailTemplate<SchoolInstructorInvitationData> = (
	data,
	locale = 'en'
) => {
	const subject = `You're Invited to Join ${data.schoolName}!`;

	const content = `
		${header({
			emoji: '🏫',
			text: 'School Invitation',
			backgroundColor: '#8b5cf6'
		})}

		${contentSection(`
			${heading(`Hi ${data.instructorName}! 👋`)}

			${paragraph(`Exciting news! <strong>${data.schoolName}</strong> has invited you to join their team of instructors.`)}

			${alert(
				`<strong>What This Means:</strong><br><br>
				By joining ${data.schoolName}, you'll be part of their instructor team and your bookings will be managed through the school. This can provide more visibility and booking opportunities!`,
				'info'
			)}

			${infoBox({
				title: '🎯 Benefits of Joining',
				content: `
					<strong>• Increased Visibility:</strong> Get featured on the school's profile<br>
					<strong>• Professional Network:</strong> Connect with other instructors<br>
					<strong>• Brand Association:</strong> Leverage the school's reputation<br>
					<strong>• Streamlined Bookings:</strong> School manages client communications
				`,
				borderColor: '#8b5cf6',
				backgroundColor: '#f5f3ff'
			})}

			${heading('Next Steps')}

			${paragraph(`
				1. <strong>Review the invitation</strong> in your dashboard<br>
				2. <strong>Learn more</strong> about ${data.schoolName}<br>
				3. <strong>Accept or decline</strong> the invitation<br>
				4. <strong>Contact the school</strong> if you have questions
			`)}
		`)}

		${actionButtons([
			{
				label: 'View Invitation',
				url: data.invitationUrl,
				backgroundColor: '#8b5cf6'
			},
			{
				label: 'View School Profile',
				url: `https://localsnow.org/schools/${data.schoolSlug}`,
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`This invitation will remain open until you respond. Take your time to review and make the best decision for your instructor career.`)}

			${paragraph(`Best regards,<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `${data.schoolName} has invited you to join their team of instructors`
		})
	};
};
