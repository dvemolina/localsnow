/**
 * Notification sent to instructor when school accepts their application
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
import type { SchoolInstructorAcceptedData } from '../schemas';

export const schoolInstructorAccepted: EmailTemplate<SchoolInstructorAcceptedData> = (
	data,
	locale = 'en'
) => {
	const subject = `Congratulations! You've Been Accepted by ${data.schoolName}`;

	const content = `
		${header({
			emoji: '🎉',
			text: 'Application Accepted!',
			backgroundColor: '#10b981'
		})}

		${contentSection(`
			${heading(`Congratulations ${data.instructorName}! 🎊`)}

			${paragraph(`Excellent news! <strong>${data.schoolName}</strong> has accepted your application. You are now part of their team of instructors!`)}

			${alert(
				`<strong>Welcome to the Team!</strong><br><br>
				You're now officially an instructor at ${data.schoolName}. Your profile is now associated with the school, and bookings will be managed through the school.`,
				'success'
			)}

			${infoBox({
				title: '🎯 What Happens Now',
				content: `
					<strong>• Your Profile Updated:</strong> You're now listed as part of ${data.schoolName}<br>
					<strong>• Booking Management:</strong> The school will handle client bookings<br>
					<strong>• Team Access:</strong> Connect with other instructors<br>
					<strong>• School Benefits:</strong> Access to school resources and support
				`,
				borderColor: '#10b981',
				backgroundColor: '#f0fdf4'
			})}

			${heading('Next Steps')}

			${paragraph(`
				1. <strong>Visit your dashboard</strong> to see your updated profile<br>
				2. <strong>Review school policies</strong> and procedures<br>
				3. <strong>Connect with the team</strong> and introduce yourself<br>
				4. <strong>Update your availability</strong> to start receiving bookings
			`)}
		`)}

		${actionButtons([
			{
				label: 'Go to Dashboard',
				url: data.dashboardUrl,
				backgroundColor: '#10b981'
			},
			{
				label: 'View School Profile',
				url: `https://localsnow.org/schools/${data.schoolSlug}`,
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`We're excited to see you grow with ${data.schoolName}. Best of luck with your lessons!`)}

			${paragraph(`Welcome aboard! 🎿❄️<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: `You've been accepted by ${data.schoolName} - Welcome to the team!`
		})
	};
};
