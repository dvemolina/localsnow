import { redirect, type RequestEvent } from "@sveltejs/kit";

export function obtainRedirectUrl(event: RequestEvent, message: string | undefined = "Session Expired. Login again to access Local Snow") {
    try {
        const redirectTo = encodeURIComponent(event.url.pathname + event.url.search);
        const redirectMessage = encodeURIComponent(message);
        return `/login?redirectTo=${redirectTo}&redirectMessage=${redirectMessage}`;
    } catch (error) {
        console.error("Error generating redirect URL", { event, message, error });
        return "/login"; // Fallback URL
    }
}

export function handleAuthRedirect(event: RequestEvent, message?: string | undefined) {
    const redirectUrl = obtainRedirectUrl(event, message);
    redirect(302, redirectUrl)
}

export function requireAuth(event: RequestEvent, message?: string | undefined) {
	const { session, user } = event.locals;

	if (!user || !session) {
		const redirectUrl = obtainRedirectUrl(event, message);
		throw redirect(302, redirectUrl);
	}

	return { user };
}