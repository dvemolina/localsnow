/**
 * Notification sent to school admin when instructor accepts their invitation
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
import type { SchoolInvitationAcceptedData } from '../schemas';

export const schoolInvitationAccepted: EmailTemplate<SchoolInvitationAcceptedData> = (
	data,
	locale = 'en'
) => {
	const subject = `${data.instructorName} Accepted Your Invitation!`;

	const details = [
		{ label: 'Instructor Name', value: data.instructorName, highlight: true },
		{ label: 'Instructor ID', value: `#${data.instructorId}` }
	];

	const content = `
		${header({
			emoji: '🎉',
			text: 'Invitation Accepted!',
			backgroundColor: '#10b981'
		})}

		${contentSection(`
			${heading(`Great News, ${data.schoolName}! 🎊`)}

			${paragraph(`Excellent! <strong>${data.instructorName}</strong> has accepted your invitation to join your team of instructors.`)}

			${alert(
				`<strong>New Team Member Added!</strong><br><br>
				${data.instructorName} is now officially part of ${data.schoolName}. They'll appear on your school profile and can start receiving bookings through the school.`,
				'success'
			)}

			${heading('Instructor Details')}

			${detailsTable(details)}

			${heading('Next Steps')}

			${paragraph(`
				1. <strong>Welcome the instructor</strong> to your team<br>
				2. <strong>Share school policies</strong> and procedures<br>
				3. <strong>Coordinate schedules</strong> and availability<br>
				4. <strong>Update your listings</strong> to showcase your growing team
			`)}

			${paragraph(`
				<strong>Tip:</strong> A warm welcome helps new instructors feel part of the team and deliver excellent service to your clients.
			`)}
		`)}

		${actionButtons([
			{
				label: 'View Instructor Profile',
				url: `https://localsnow.org/instructors/${data.instructorId}`,
				backgroundColor: '#10b981'
			},
			{
				label: 'Manage Team',
				url: 'https://localsnow.org/dashboard/school/instructors',
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`Congratulations on growing your team! We're excited to see ${data.schoolName} continue to thrive.`)}

			${paragraph(`Best regards,<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `${data.instructorName} has joined ${data.schoolName}!`
		})
	};
};
