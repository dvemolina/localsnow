import { redirect, type RequestEvent } from "@sveltejs/kit";
import { requireAuth } from "./auth";
import { hasAnyRole, type UserRole } from "./roles";
import { extractLocale, type Locale } from "$src/lib/i18n/routes";
import { route } from "$src/lib/i18n/routeHelpers";

export function requireDashboardRole(
	event: RequestEvent,
	roles: UserRole[],
	message = 'Login required to access dashboard'
) {
	const user = requireAuth(event, message);
	if (!hasAnyRole(user, roles)) {
		const { locale } = extractLocale(event.url.pathname);
		const effectiveLocale = (locale ?? 'en') as Locale;
		throw redirect(302, route('/dashboard', effectiveLocale));
	}
	return user;
}
