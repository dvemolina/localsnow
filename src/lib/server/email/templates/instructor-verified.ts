/**
 * Notification sent to instructor when admin verifies their qualification
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
import type { InstructorVerifiedData } from '../schemas';

export const instructorVerified: EmailTemplate<InstructorVerifiedData> = (
	data,
	locale = 'en'
) => {
	const subject = `You're Verified! Your Local Snow Profile is Now Live`;

	const content = `
		${header({
			emoji: '✅',
			text: 'Verification Approved!',
			backgroundColor: '#10b981'
		})}

		${contentSection(`
			${heading(`Congratulations ${data.instructorName}! 🎉`)}

			${paragraph(`Great news! Your qualifications have been reviewed and approved by our team. Your instructor profile is now <strong>verified</strong> on Local Snow.`)}

			${alert(
				`<strong>You're officially verified!</strong><br><br>
				A verified badge now appears on your profile, letting clients know you're a trusted and qualified instructor.`,
				'success'
			)}

			${infoBox({
				title: '🎯 What This Means For You',
				content: `
					<strong>• Verified Badge:</strong> Your profile now shows a verified badge<br>
					<strong>• More Visibility:</strong> Verified instructors rank higher in search results<br>
					<strong>• Client Trust:</strong> Clients are more likely to book verified instructors<br>
					<strong>• Full Access:</strong> All platform features are now available to you
				`,
				borderColor: '#10b981',
				backgroundColor: '#f0fdf4'
			})}

			${heading('Next Steps')}

			${paragraph(`
				1. <strong>Complete your profile</strong> with photos and a great bio<br>
				2. <strong>Set your availability</strong> so clients can book you<br>
				3. <strong>Add your lessons</strong> and pricing<br>
				4. <strong>Start accepting bookings</strong> and grow your business
			`)}
		`)}

		${actionButtons([
			{
				label: 'Go to Dashboard',
				url: data.dashboardUrl,
				backgroundColor: '#10b981'
			},
			{
				label: 'View My Profile',
				url: 'https://localsnow.org/dashboard/profile',
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(`We're excited to have you as a verified instructor on Local Snow. Best of luck with your lessons!`)}

			${paragraph(`Happy teaching! 🎿❄️<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: 'Your instructor profile has been verified - you\'re all set!'
		})
	};
};
