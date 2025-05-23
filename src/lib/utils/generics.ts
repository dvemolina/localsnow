import 'dotenv';

export const items = [
	{ label: 'Instructors', href: '/instructors' },
	{ label: 'Resorts', href: '/location' },
	{ label: 'Access', href: '/signup' },
	{ label: 'About', href: '/about' }
];

export function getProjectUrl() {
	if(process.env.NODE_ENV === "production"){
		return 'https://localsnow.org'
	}else {
		return 'http://localhost:5173'
	}
}

export function isCurrentPath(href: string, currentPath: string) {
	// Remove language prefixes from both paths
	const cleanHref = href.replace(/^\/[a-z]{2}(\/|$)/, '/');
	const cleanCurrent = currentPath.replace(/^\/[a-z]{2}(\/|$)/, '/');

	// Also handle cases where one path has a trailing slash and the other doesn't
	return cleanHref.replace(/\/$/, '') === cleanCurrent.replace(/\/$/, '');
}

import type { GoogleClaims } from '../server/oauth/google';

export function generateUsernameFromGoogle(claims: GoogleClaims) {
    // Extract last 3 digits from sub
    const lastThreeDigits = claims.sub.slice(-3);

    // Format name and surname
    const formattedName = claims.given_name.toLowerCase();
    const firstLetterSurname = claims.family_name.charAt(0).toLowerCase();

    // Combine into username
    return `${formattedName}${firstLetterSurname}${lastThreeDigits}`;
}
