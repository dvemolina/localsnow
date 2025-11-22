import type { Reroute } from '@sveltejs/kit';
import { extractLocale, getRouteKey, getLocalizedPath } from '$lib/i18n/routes';

/**
 * SvelteKit reroute hook - maps translated URLs to actual route files
 *
 * This allows users to visit /es/acerca-de and have it serve the /about route
 * while maintaining the translated URL in the browser.
 *
 * Examples:
 * - /es/acerca-de → /about (serves src/routes/about/+page.svelte)
 * - /es/instructores → /instructors (serves src/routes/instructors/+page.svelte)
 * - /es/instructores/123 → /instructors/123 (serves dynamic route)
 */
export const reroute: Reroute = ({ url }) => {
	const pathname = url.pathname;

	// Extract locale and path from URL
	const { locale, path } = extractLocale(pathname);

	// If no locale detected, return as-is
	if (!locale) {
		return pathname;
	}

	// Try to find the route key for this localized path
	const routeKey = getRouteKey(pathname);

	if (routeKey) {
		// This is a known translated route, return the English path
		// (since our actual route files use English names)
		const englishPath = getLocalizedPath(routeKey, 'en');
		return englishPath;
	}

	// For dynamic routes (e.g., /es/instructores/123)
	// Try to find a matching base route
	const segments = path.split('/').filter(Boolean);

	for (let i = segments.length; i > 0; i--) {
		const testPath = '/' + segments.slice(0, i).join('/');
		const fullTestPath = `/${locale}${testPath}`;
		const key = getRouteKey(fullTestPath);

		if (key) {
			// Found a base route, construct the English path with remaining segments
			const englishBase = getLocalizedPath(key, 'en');
			const remainingSegments = segments.slice(i);

			if (remainingSegments.length > 0) {
				return `${englishBase}/${remainingSegments.join('/')}`;
			}

			return englishBase;
		}
	}

	// Not a translated route, return path without locale prefix
	// (this handles API routes, admin routes, etc.)
	return path;
};