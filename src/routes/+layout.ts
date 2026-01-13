import type { LayoutLoad } from './$types';
import { locale } from '$lib/i18n/i18n';

// Prerender disabled - app has dynamic content (auth, bookings, payments)
// Individual pages can enable prerender if they're static
export const prerender = false;

export const load: LayoutLoad = async ({ data }) => {
	// Set the current locale from server data
	if (data.locale) {
		await locale.set(data.locale);
	}

	return data;
};
