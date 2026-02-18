/**
 * Centralized Route Translation Configuration
 *
 * This file maps logical route keys to their localized URL paths.
 * When adding new routes, simply add them here and they'll automatically
 * work with the translation system.
 *
 * Usage:
 *   import { route } from '$lib/i18n/routes';
 *   <a href={route('/about')}>About</a>
 *   // Renders: /es/acerca-de (Spanish) or /en/about (English)
 */

export type Locale = 'en' | 'es';

/**
 * Route translations mapping
 * Key: route identifier (use English path as convention)
 * Value: object with locale-specific paths
 */
export const routeTranslations = {
	// Home
	'/': {
		en: '/',
		es: '/'
	},

	// Main pages
	'/about': {
		en: '/about',
		es: '/acerca-de'
	},
	'/how-it-works': {
		en: '/how-it-works',
		es: '/como-funciona'
	},
	'/contact': {
		en: '/contact',
		es: '/contacto'
	},

	// Instructors
	'/instructors': {
		en: '/instructors',
		es: '/instructores'
	},
	'/schools': {
		en: '/schools',
		es: '/escuelas'
	},

	// Resorts
	'/resorts': {
		en: '/resorts',
		es: '/estaciones'
	},

	// Auth routes
	'/login': {
		en: '/login',
		es: '/iniciar-sesion'
	},
	'/signup': {
		en: '/signup',
		es: '/registrarse'
	},

	// Dashboard routes
	'/dashboard': {
		en: '/dashboard',
		es: '/panel'
	},
	'/dashboard/profile': {
		en: '/dashboard/profile',
		es: '/panel/perfil'
	},
	'/dashboard/bookings': {
		en: '/dashboard/bookings',
		es: '/panel/reservas'
	},
	'/dashboard/my-bookings': {
		en: '/dashboard/my-bookings',
		es: '/panel/mis-reservas'
	},
	'/dashboard/lessons': {
		en: '/dashboard/lessons',
		es: '/panel/clases'
	},
	'/dashboard/availability': {
		en: '/dashboard/availability',
		es: '/panel/disponibilidad'
	},
	'/dashboard/choose-role': {
		en: '/dashboard/choose-role',
		es: '/panel/elegir-rol'
	},

	// Booking routes
	'/booking/booking-success': {
		en: '/booking/booking-success',
		es: '/reserva/exito'
	},
	'/booking/booking-error': {
		en: '/booking/booking-error',
		es: '/reserva/error'
	},

	// Legal pages
	'/legal/privacy': {
		en: '/legal/privacy',
		es: '/legal/privacidad'
	},
	'/legal/terms': {
		en: '/legal/terms',
		es: '/legal/terminos'
	},
	'/legal/cookies': {
		en: '/legal/cookies',
		es: '/legal/cookies'
	},

	// Admin routes (keep in English for consistency)
	'/admin': {
		en: '/admin',
		es: '/admin'
	},

	// API routes (never translated)
	'/api': {
		en: '/api',
		es: '/api'
	}
} as const;

/**
 * Reverse mapping: localized path -> route key
 * Automatically generated from routeTranslations
 */
export const pathToRouteKey = (() => {
	const map = new Map<string, string>();

	for (const [key, translations] of Object.entries(routeTranslations)) {
		for (const locale of ['en', 'es'] as const) {
			const path = translations[locale];
			// Store with locale prefix for lookup
			map.set(`/${locale}${path}`, key);
			// Also store without locale for base locale
			if (locale === 'en') {
				map.set(path, key);
			}
		}
	}

	return map;
})();

/**
 * Check if a path should be translated
 * API routes, static files, etc. should not be translated
 */
export function shouldTranslatePath(pathname: string): boolean {
	// Don't translate API routes
	if (pathname.startsWith('/api')) return false;

	// Don't translate OAuth routes (must match Google Console callback URLs exactly)
	if (pathname.startsWith('/oauth')) return false;

	// Don't translate static files
	if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|webm|mp4)$/)) {
		return false;
	}

	// Don't translate admin routes (optional - keep in English)
	if (pathname.startsWith('/admin')) return false;

	return true;
}

/**
 * Extract locale from pathname
 * Returns locale and pathname without locale prefix
 */
export function extractLocale(pathname: string): { locale: Locale | null; path: string } {
	const match = pathname.match(/^\/(en|es)(\/.*)?$/);

	if (match) {
		return {
			locale: match[1] as Locale,
			path: match[2] || '/'
		};
	}

	return {
		locale: null,
		path: pathname
	};
}

/**
 * Get route key from localized path
 */
export function getRouteKey(pathname: string): string | null {
	return pathToRouteKey.get(pathname) || null;
}

/**
 * Get localized path for a route key and locale
 */
export function getLocalizedPath(routeKey: string, locale: Locale): string {
	const translation = routeTranslations[routeKey as keyof typeof routeTranslations];

	if (!translation) {
		console.warn(`No translation found for route: ${routeKey}`);
		return routeKey;
	}

	return translation[locale];
}

/**
 * Match a dynamic route pattern
 * Handles patterns like /instructors/[id] or /resorts/[slug]/[tab]
 */
export function matchDynamicRoute(pathname: string): {
	routeKey: string;
	params: Record<string, string>;
} | null {
	const { path } = extractLocale(pathname);

	// Try exact match first
	const exactKey = getRouteKey(pathname);
	if (exactKey) {
		return { routeKey: exactKey, params: {} };
	}

	// Try dynamic matching
	// This is a simplified version - SvelteKit handles the real matching
	// We just need to identify the base route
	const segments = path.split('/').filter(Boolean);

	// Try progressively shorter paths to find base route
	for (let i = segments.length; i > 0; i--) {
		const testPath = '/' + segments.slice(0, i).join('/');
		const key = getRouteKey(testPath);

		if (key) {
			// Found base route, extract params
			const params: Record<string, string> = {};
			// Remaining segments are params
			for (let j = i; j < segments.length; j++) {
				params[`param${j - i}`] = segments[j];
			}
			return { routeKey: key, params };
		}
	}

	return null;
}
