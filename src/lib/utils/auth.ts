import { redirect, type RequestEvent } from "@sveltejs/kit";
import bcrypt from 'bcryptjs';

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


export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword; 
}

export async function verifyPasswordHash(password: string, hashedPassword: string): Promise<boolean> {
    const result = await bcrypt.compare(password, hashedPassword)
    return result
}

export function getClientIP(event: RequestEvent): string | null {
	const forwarded = event.request.headers.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}
	if (typeof event.getClientAddress === "function") {
		return event.getClientAddress();
	}
	return null;
}
