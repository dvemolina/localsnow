import type { LayoutLoad } from './$types';
import { locale } from '$lib/i18n/i18n';
import { extractLocale } from '$lib/i18n/routes';

// Prerender disabled - app has dynamic content (auth, bookings, payments)
// Individual pages can enable prerender if they're static
export const prerender = false;

export const load: LayoutLoad = async ({ data, url }) => {
	const pathLocale = extractLocale(url.pathname).locale;
	const activeLocale = pathLocale ?? data.locale;

	// Set the current locale from the visible URL first. Translated routes reroute
	// to English route files internally, so server data can lag behind the locale
	// prefix the user is actually visiting.
	if (activeLocale) {
		await locale.set(activeLocale);
	}

	return data;
};
