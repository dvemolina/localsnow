import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getCanonicalUrl } from '$lib/utils/seo';
import * as auth from '$src/lib/server/session.js';
import { RefillingTokenBucket } from './lib/server/rate-limit';
import { getClientIP } from './lib/utils/auth';

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

const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
	  event.request = localizedRequest;
	  return resolve(event, {
		transformPageChunk: ({ html }) => {
		  return html
			.replace('%lang%', locale)
			.replace('%canonical%', getCanonicalUrl(event.url, locale));
		}
	  });
	});


export const handle: Handle = sequence(rateLimitHandle, paraglideHandle, handleAuth);
