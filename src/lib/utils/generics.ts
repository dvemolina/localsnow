import 'dotenv';

export const items = [
	{ label: 'Instructors', href: '/instructors' },
	{ label: 'Resorts', href: '/location' },
	{ label: 'Access', href: '/signup' },
	{ label: 'About', href: '/about' }
];

export function getProjectUrl() {
	if(process.env.NODE_ENV === "production"){
		return 'https://localsnow.com'
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

import { redirect, type RequestEvent } from "@sveltejs/kit";
import type { GoogleClaims } from '../server/oauth/google';

export function obtainRedirectUrl(event: RequestEvent, message: string | undefined = "Access your account to use Wave Journal App") {
    try {
        const redirectTo = encodeURIComponent(event.url.pathname + event.url.search);
        const redirectMessage = encodeURIComponent(message);
        return `/access?redirectTo=${redirectTo}&redirectMessage=${redirectMessage}`;
    } catch (error) {
        console.error("Error generating redirect URL", { event, message, error });
        return "/access"; // Fallback URL
    }
}

export function handleAuthRedirect(event: RequestEvent) {
    const redirectUrl = obtainRedirectUrl(event);
    redirect(302, redirectUrl)
}

export function generateUsernameFromGoogle(claims: GoogleClaims) {
    // Extract last 3 digits from sub
    const lastThreeDigits = claims.sub.slice(-3);

    // Format name and surname
    const formattedName = claims.given_name.toLowerCase();
    const firstLetterSurname = claims.family_name.charAt(0).toLowerCase();

    // Combine into username
    return `${formattedName}${firstLetterSurname}${lastThreeDigits}`;
}
