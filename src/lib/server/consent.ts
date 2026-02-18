import type { RequestEvent } from '@sveltejs/kit';

export type CookieConsentStatus = 'accepted' | 'rejected' | 'unknown';

function isKnownConsentStatus(
	value: string | null
): value is Exclude<CookieConsentStatus, 'unknown'> {
	return value === 'accepted' || value === 'rejected';
}

/**
 * Resolve consent status for optional measurement from cookies first, then request headers.
 * Header fallback supports future non-browser clients.
 */
export function getCookieConsentStatus(
	event: Pick<RequestEvent, 'cookies' | 'request'>
): CookieConsentStatus {
	const cookieValue = event.cookies.get('cookie_consent') ?? null;
	if (isKnownConsentStatus(cookieValue)) {
		return cookieValue;
	}

	const headerValue = event.request.headers.get('x-cookie-consent');
	if (isKnownConsentStatus(headerValue)) {
		return headerValue;
	}

	return 'unknown';
}

export function hasMeasurementConsent(status: CookieConsentStatus): boolean {
	return status === 'accepted';
}
