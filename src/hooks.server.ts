import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getCanonicalUrl } from '$lib/i18n/routeHelpers';
import * as auth from '$src/lib/server/session.js';
import { RefillingTokenBucket } from './lib/server/rate-limit';
import { getClientIP } from './lib/utils/auth';
import { extractLocale, shouldTranslatePath, type Locale } from '$lib/i18n/routes';
import { redirect } from '@sveltejs/kit';
import { route } from '$lib/i18n/routeHelpers';

const bucket = new RefillingTokenBucket<string>(100, 1);

const rateLimitHandle: Handle = async ({ event, resolve }) => {
	const clientIP = getClientIP(event);
	if (clientIP === null) {
		return resolve(event);
	}
	let cost: number;
	if (event.request.method === "GET" || event.request.method === "OPTIONS") {
		cost = 1;
	} else {
		cost = 3;
	}
	if (!bucket.consume(clientIP, cost)) {
		return new Response("Too many requests", {
			status: 429
		});
	}
	return resolve(event);
};

/**
 * Handle for language detection and redirects
 * Ensures users are redirected to properly localized URLs
 */
const languageHandle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	// Skip non-page requests (API, static files, etc.)
	if (!shouldTranslatePath(pathname)) {
		return resolve(event);
	}

	const { locale, path } = extractLocale(pathname);

	// If URL doesn't have locale prefix, redirect to localized version
	if (!locale) {
		// Detect preferred language from Accept-Language header or cookie
		const acceptLanguage = event.request.headers.get('accept-language');
		const cookieLocale = event.cookies.get('locale');

		let preferredLocale: Locale = 'en'; // Default to English

		// Check cookie first
		if (cookieLocale === 'es' || cookieLocale === 'en') {
			preferredLocale = cookieLocale;
		}
		// Then check Accept-Language header
		else if (acceptLanguage) {
			// Prefer Spanish for Spain-focused platform if user accepts it
			if (acceptLanguage.includes('es')) {
				preferredLocale = 'es';
			}
		}

		// Redirect to localized URL
		const localizedUrl = route(pathname, preferredLocale);
		throw redirect(307, localizedUrl);
	}

	// Set locale cookie for future visits
	event.cookies.set('locale', locale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365, // 1 year
		sameSite: 'lax',
		httpOnly: false // Accessible to client-side for language switcher
	});

	return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

const paraglideHandle: Handle = async ({ event, resolve }) => {
	// Extract locale from our translated URL (already set by languageHandle)
	const { locale: detectedLocale } = extractLocale(event.url.pathname);
	const currentLocale = (detectedLocale || 'en') as string;

	// Create a standardized URL for Paraglide with /<locale>/<path> format
	// Paraglide expects this pattern to detect the language
	const originalPathname = event.url.pathname;
	const modifiedUrl = new URL(event.request.url);

	// If we don't have a locale prefix yet, add it
	if (!detectedLocale) {
		modifiedUrl.pathname = `/${currentLocale}${originalPathname}`;
	}

	const modifiedRequest = new Request(modifiedUrl, event.request);

	return paraglideMiddleware(modifiedRequest, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html
					.replace('%lang%', locale)
					.replace('%canonical%', getCanonicalUrl(event.url, locale as Locale));
			}
		});
	});
};


export const handle: Handle = sequence(rateLimitHandle, languageHandle, paraglideHandle, handleAuth);
