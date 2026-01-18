import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { getCanonicalUrl } from '$lib/i18n/routeHelpers';
import * as auth from '$src/lib/server/session.js';
import { RefillingTokenBucket } from './lib/server/rate-limit';
import { getClientIP } from './lib/utils/auth';
import { extractLocale, shouldTranslatePath, type Locale } from '$lib/i18n/routes';
import { route } from '$lib/i18n/routeHelpers';
import { validateConfig } from './lib/server/config';

const bucket = new RefillingTokenBucket<string>(100, 1);

const rateLimitHandle: Handle = async ({ event, resolve }) => {
	const clientIP = getClientIP(event);
	if (clientIP === null) {
		return resolve(event);
	}
	let cost: number;
	if (event.request.method === 'GET' || event.request.method === 'OPTIONS') {
		cost = 1;
	} else {
		cost = 3;
	}
	if (!bucket.consume(clientIP, cost)) {
		return new Response('Too many requests', {
			status: 429
		});
	}
	return resolve(event);
};

const loggingHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	console.log('[Request]', event.request.method, event.url.pathname, '->', response.status);
	return response;
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

	const { locale } = extractLocale(pathname);
	let localizedUrl;

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
		console.log('[Language Redirect]', pathname, '→', localizedUrl, `(locale: ${preferredLocale})`);

		// Throw redirect directly - no try-catch to avoid interfering with SvelteKit
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

const i18nHandle: Handle = async ({ event, resolve }) => {
	// Extract locale from our translated URL (already set by languageHandle)
	const { locale: detectedLocale } = extractLocale(event.url.pathname);
	const currentLocale = (detectedLocale || 'en') as Locale;

	// Store locale in event.locals for use in load functions
	event.locals.locale = currentLocale;

	return resolve(event, {
		transformPageChunk: ({ html }) => {
			return html
				.replace('%lang%', currentLocale)
				.replace('%canonical%', getCanonicalUrl(event.url, currentLocale));
		}
	});
};

if (process.env.NODE_ENV === 'production') {
	const { valid, missing } = validateConfig();
	if (!valid) {
		console.error('❌ FATAL: Missing required configuration:', missing);
		process.exit(1);
	}
	console.log('✅ Configuration validated successfully');
}

export const handle: Handle = async (input) => {
	// Run language redirect FIRST, completely separate from other hooks
	// This ensures the redirect isn't caught or modified by other handlers
	const pathname = input.event.url.pathname;

	if (shouldTranslatePath(pathname)) {
		const { locale } = extractLocale(pathname);

		if (!locale) {
			// Need to redirect
			const acceptLanguage = input.event.request.headers.get('accept-language');
			const cookieLocale = input.event.cookies.get('locale');
			let preferredLocale: Locale = 'en';

			if (cookieLocale === 'es' || cookieLocale === 'en') {
				preferredLocale = cookieLocale;
			} else if (acceptLanguage?.includes('es')) {
				preferredLocale = 'es';
			}

			const localizedUrl = route(pathname, preferredLocale);
			console.log('[Language Redirect]', pathname, '→', localizedUrl, `(locale: ${preferredLocale})`);

			// Return redirect response directly
			throw redirect(307, localizedUrl);
		}
	}

	// If no redirect needed, run the normal hook sequence
	const handleSequence = sequence(
		Sentry.sentryHandle(),
		sequence(rateLimitHandle, i18nHandle, handleAuth)
	);

	return handleSequence(input);
};

// Wrap Sentry's error handler to exclude redirects (300-399 status codes)
export const handleError = (({ error, event }) => {
	// Don't treat redirects as errors
	if (error && typeof error === 'object' && 'status' in error) {
		const status = (error as { status: number }).status;
		if (status >= 300 && status < 400) {
			// This is a redirect, not an error - don't send to Sentry
			console.log('[HandleError] Skipping Sentry for redirect:', status);
			return {
				message: 'Redirect'
			};
		}
	}

	// For actual errors, use Sentry's handler
	const sentryHandler = Sentry.handleErrorWithSentry();
	return sentryHandler({ error, event });
}) satisfies import('@sveltejs/kit').HandleServerError;
