/**
 * Welcome email sent to new users after signup
 */

import { wrapEmail } from '../base';
import { header, contentSection, paragraph, heading, actionButtons } from '../components';
import type { EmailTemplate, Locale } from '../types';
import type { SignupWelcomeData } from '../schemas';

export const signupWelcome: EmailTemplate<SignupWelcomeData> = (data, locale = 'en') => {
	const subject = `Welcome to Local Snow! 🎿`;

	const content = `
		${header({
			emoji: '🎿',
			text: 'Welcome to Local Snow!'
		})}

		${contentSection(`
			${heading(`Hi ${data.name}! 👋`)}

				${paragraph(
					`Welcome to Local Snow - the platform connecting winter sports enthusiasts with expert local instructors. We're thrilled to have you join our community!`
				)}

				${paragraph(`Local Snow is fully free to use as a directory, and no access code is required.`)}

			${heading('What You Can Do')}

			${paragraph(`
				<strong>🔍 Find Instructors:</strong> Search for certified snow sports instructors in your area<br>
				<strong>📅 Book Lessons:</strong> Schedule lessons directly with instructors<br>
				<strong>💬 Direct Communication:</strong> Connect with instructors to plan your perfect lesson<br>
				<strong>⭐ Build Trust:</strong> Read reviews and check credentials
			`)}

			${heading('Ready to Get Started?')}

			${paragraph(
				`Browse our community of skilled instructors and find the perfect match for your snow sports journey.`
			)}
		`)}

		${actionButtons([
			{
				label: 'Browse Instructors',
				url: 'https://localsnow.org/instructors'
			},
			{
				label: 'My Dashboard',
				url: 'https://localsnow.org/dashboard',
				backgroundColor: '#6b7280'
			}
		])}

		${contentSection(`
			${paragraph(
				`If you have any questions or need help getting started, feel free to reach out to our support team.`
			)}

			${paragraph(`Happy skiing! 🎿❄️<br><strong>The Local Snow Team</strong>`)}
		`)}
	`;

	return {
		subject,
		html: wrapEmail(content, {
			preheader: 'Welcome to Local Snow - Connect with expert snow sports instructors'
		})
	};
};
