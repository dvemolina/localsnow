/**
 * Route Helper Utilities
 *
 * Provides easy-to-use functions for generating localized URLs
 * throughout the application.
 */

import { getLocale } from '$lib/paraglide/runtime';
import { getLocalizedPath, shouldTranslatePath, extractLocale, getRouteKey, type Locale } from './routes';

/**
 * Generate a localized URL for a route
 *
 * @param path - The route key (e.g., '/about') or full path
 * @param locale - Optional locale (defaults to current locale)
 * @param params - Optional URL parameters for dynamic routes
 *
 * @example
 * route('/about') // Returns: /es/acerca-de (in Spanish)
 * route('/about', 'en') // Returns: /en/about
 * route('/instructors/123') // Returns: /es/instructores/123
 */
export function route(path: string, locale?: Locale, params?: Record<string, string>): string {
	const currentLocale = locale || (getLocale() as Locale);

	// Don't translate certain paths
	if (!shouldTranslatePath(path)) {
		return path;
	}

	// Handle paths that already have locale prefix
	const { locale: existingLocale, path: cleanPath } = extractLocale(path);
	const pathToTranslate = existingLocale ? cleanPath : path;

	// Split path into base and dynamic parts
	const pathParts = pathToTranslate.split('/').filter(Boolean);
	let basePath = '/';
	let dynamicParts: string[] = [];

	// Find the longest matching base route
	for (let i = pathParts.length; i > 0; i--) {
		const testPath = '/' + pathParts.slice(0, i).join('/');
		const localizedBase = getLocalizedPath(testPath, currentLocale);

		if (localizedBase !== testPath || i === 1) {
			basePath = localizedBase;
			dynamicParts = pathParts.slice(i);
			break;
		}
	}

	// Build final path
	let finalPath = basePath;

	// Add dynamic parts
	if (dynamicParts.length > 0) {
		finalPath += '/' + dynamicParts.join('/');
	}

	// Add URL parameters if provided
	if (params) {
		const urlParams = new URLSearchParams(params);
		const queryString = urlParams.toString();
		if (queryString) {
			finalPath += '?' + queryString;
		}
	}

	// Add locale prefix
	return `/${currentLocale}${finalPath}`;
}

/**
 * Generate alternate language URLs for hreflang tags
 *
 * @param path - Current path
 * @returns Array of { locale, url } objects
 */
export function getAlternateUrls(path: string): Array<{ locale: Locale; url: string }> {
	const locales: Locale[] = ['en', 'es'];

	return locales.map((locale) => ({
		locale,
		url: route(path, locale)
	}));
}

/**
 * Get the canonical URL for SEO
 *
 * @param url - Full URL object
 * @param locale - Current locale
 * @returns Canonical URL string
 */
export function getCanonicalUrl(url: URL, locale: Locale): string {
	const { path } = extractLocale(url.pathname);
	const localizedPath = route(path, locale);

	return `${url.origin}${localizedPath}`;
}

/**
 * Redirect to localized version of current path
 *
 * @param pathname - Current pathname (localized, e.g., /es/acerca-de)
 * @param targetLocale - Locale to redirect to
 * @returns Redirect URL in target locale (e.g., /en/about)
 */
export function getLocalizedRedirect(pathname: string, targetLocale: Locale): string {
	const { locale: currentLocale, path } = extractLocale(pathname);

	if (!currentLocale) {
		// No locale in URL, just add target locale
		return route(pathname, targetLocale);
	}

	// We have a localized path (e.g., /es/acerca-de)
	// Need to find its route key first, then translate to target locale

	// Try exact match for the full path
	const routeKey = getRouteKey(pathname);

	if (routeKey) {
		// Found exact match - generate URL in target locale
		// E.g., /es/acerca-de -> route key '/about' -> /en/about
		return route(routeKey, targetLocale);
	}

	// Try to match dynamic routes (e.g., /es/instructores/123)
	const segments = path.split('/').filter(Boolean);

	for (let i = segments.length; i > 0; i--) {
		const testPath = '/' + segments.slice(0, i).join('/');
		const fullTestPath = `/${currentLocale}${testPath}`;
		const key = getRouteKey(fullTestPath);

		if (key) {
			// Found base route, preserve dynamic segments
			// E.g., /es/instructores/123 -> key '/instructors' -> /en/instructors/123
			const remainingSegments = segments.slice(i);
			const baseUrl = route(key, targetLocale);

			if (remainingSegments.length > 0) {
				// Remove locale prefix from baseUrl and add remaining segments
				const { path: basePath } = extractLocale(baseUrl);
				return `/${targetLocale}${basePath}/${remainingSegments.join('/')}`;
			}

			return baseUrl;
		}
	}

	// Fallback: couldn't find route key, just swap locale prefix
	// This handles unknown/non-translated routes
	return `/${targetLocale}${path}`;
}

/**
 * Check if current path matches a route key
 *
 * @param pathname - Current pathname
 * @param routeKey - Route key to check (e.g., '/about')
 * @returns true if paths match
 */
export function isRoute(pathname: string, routeKey: string): boolean {
	const { path } = extractLocale(pathname);
	const enPath = getLocalizedPath(routeKey, 'en');
	const esPath = getLocalizedPath(routeKey, 'es');

	return path === enPath || path === esPath || path.startsWith(enPath + '/') || path.startsWith(esPath + '/');
}

/**
 * Get the base locale URL (without language prefix)
 * Useful for language switchers
 *
 * @param pathname - Current pathname
 * @returns Path without locale prefix
 */
export function getBaseUrl(pathname: string): string {
	const { path } = extractLocale(pathname);
	return path;
}
