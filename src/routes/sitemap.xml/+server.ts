// src/routes/sitemap.xml/+server.ts
import { getAllResortSportCombinations } from '$src/lib/server/services/seoLandingService';
import { db } from '$src/lib/server/db';
import { users, resorts, regions, countries, schools, userRoles } from '$src/lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { generateInstructorSlug } from '$lib/utils/slug';
import { routeTranslations, type Locale } from '$lib/i18n/routes';

const SITE_URL = 'https://localsnow.org';
const DEFAULT_LOCALE: Locale = 'en';
const SUPPORTED_LOCALES: Locale[] = ['en', 'es'];

const ROUTE_KEYS = Object.keys(routeTranslations).sort((a, b) => b.length - a.length);

function localizePath(path: string, locale: Locale): string {
	const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '/';

	if (normalizedPath === '/') {
		return `/${locale}/`;
	}

	for (const routeKey of ROUTE_KEYS) {
		if (normalizedPath === routeKey || normalizedPath.startsWith(`${routeKey}/`)) {
			const localizedBase = routeTranslations[routeKey as keyof typeof routeTranslations][locale];
			const suffix = normalizedPath.slice(routeKey.length);
			return `/${locale}${localizedBase}${suffix}`;
		}
	}

	// Fallback for non-translated paths.
	return `/${locale}${normalizedPath}`;
}

function buildLocalizedUrl(path: string, locale: Locale): string {
	return `${SITE_URL}${localizePath(path, locale)}`;
}

// Helper function to generate URL entry (path without locale)
function urlEntry(path: string, priority: string, changefreq: string, lastmod?: string): string {
	const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
	const loc = buildLocalizedUrl(path, DEFAULT_LOCALE);
	return `
  <url>
    <loc>${loc}</loc>
    ${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${SUPPORTED_LOCALES.map(
			(locale) =>
				`<xhtml:link rel="alternate" hreflang="${locale}" href="${buildLocalizedUrl(path, locale)}" />`
		).join('\n    ')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${buildLocalizedUrl(path, DEFAULT_LOCALE)}" />
  </url>`;
}

export const GET: RequestHandler = async () => {
	try {
		// Get current date for lastmod
		const today = new Date().toISOString().split('T')[0];

		const urls: string[] = [];

		// 1. Static pages (high priority)
		const staticPages = [
			{ url: '/', priority: '1.0', changefreq: 'daily' }, // Homepage
			{ url: '/instructors', priority: '0.9', changefreq: 'daily' },
			{ url: '/schools', priority: '0.9', changefreq: 'daily' },
			{ url: '/resorts', priority: '0.8', changefreq: 'weekly' },
			{ url: '/signup', priority: '0.8', changefreq: 'weekly' },
			{ url: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
			{ url: '/about', priority: '0.6', changefreq: 'monthly' },
			{ url: '/contact', priority: '0.6', changefreq: 'monthly' }
		];

		staticPages.forEach((page) => {
			urls.push(urlEntry(page.url, page.priority, page.changefreq, today));
		});

		// 2. Legal pages (lower priority)
		const legalPages = [
			{ url: '/legal/privacy', priority: '0.3', changefreq: 'yearly' },
			{ url: '/legal/terms', priority: '0.3', changefreq: 'yearly' },
			{ url: '/legal/cookies', priority: '0.3', changefreq: 'yearly' }
		];

		legalPages.forEach((page) => {
			urls.push(urlEntry(page.url, page.priority, page.changefreq));
		});

		// 3. Instructor profiles (dynamic, high priority)
		const instructors = await db
			.select({
				id: users.id,
				name: users.name,
				lastName: users.lastName,
				updatedAt: users.updatedAt
			})
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.where(
				and(
					eq(users.isVerified, true),
					eq(users.accountStatus, 'active'),
					inArray(userRoles.role, ['instructor-independent', 'instructor-school'])
				)
			)
			.limit(1000); // Limit to prevent performance issues

		instructors.forEach((instructor) => {
			const lastmod = instructor.updatedAt
				? new Date(instructor.updatedAt).toISOString().split('T')[0]
				: undefined;
			const instructorSlug = generateInstructorSlug(
				instructor.id,
				instructor.name,
				instructor.lastName
			);
			urls.push(urlEntry(`/instructors/${instructorSlug}`, '0.8', 'weekly', lastmod));
		});

		// 3b. School profiles (dynamic, high priority)
		const schoolProfiles = await db
			.select({
				slug: schools.slug,
				name: schools.name
			})
			.from(schools)
			.where(eq(schools.isPublished, true))
			.limit(1000); // Limit to prevent performance issues

		schoolProfiles.forEach((school) => {
			urls.push(urlEntry(`/schools/${school.slug}`, '0.8', 'weekly', today));
		});

		// 4. Resort hierarchy pages (dynamic, hierarchical priority)
		// Get all countries
		const allCountries = await db
			.select({
				countrySlug: countries.countrySlug
			})
			.from(countries)
			.groupBy(countries.countrySlug);

		allCountries.forEach((country) => {
			urls.push(urlEntry(`/resorts/${country.countrySlug}`, '0.7', 'weekly', today));
		});

		// Get all regions
		const allRegions = await db
			.select({
				countrySlug: countries.countrySlug,
				regionSlug: regions.regionSlug
			})
			.from(regions)
			.innerJoin(countries, eq(regions.countryId, countries.id))
			.groupBy(countries.countrySlug, regions.regionSlug);

		allRegions.forEach((region) => {
			urls.push(
				urlEntry(`/resorts/${region.countrySlug}/${region.regionSlug}`, '0.7', 'weekly', today)
			);
		});

		// Get all resorts
		const allResorts = await db
			.select({
				countrySlug: countries.countrySlug,
				regionSlug: regions.regionSlug,
				resortSlug: resorts.slug
			})
			.from(resorts)
			.innerJoin(countries, eq(resorts.countryId, countries.id))
			.leftJoin(regions, eq(resorts.regionId, regions.id))
			.groupBy(countries.countrySlug, regions.regionSlug, resorts.slug);

		allResorts.forEach((resort) => {
			const regionPath = resort.regionSlug ? `/${resort.regionSlug}` : '';
			const baseResortUrl = `/resorts/${resort.countrySlug}${regionPath}/${resort.resortSlug}`;

			// Resort main page
			urls.push(urlEntry(baseResortUrl, '0.8', 'weekly', today));

			// Resort instructors page (all instructors at this resort)
			urls.push(urlEntry(`${baseResortUrl}/instructors`, '0.85', 'daily', today));

			// Resort schools page (all schools at this resort)
			urls.push(urlEntry(`${baseResortUrl}/schools`, '0.85', 'daily', today));
		});

		// 5. Resort + Sport combinations (highest priority for conversions)
		const resortSportCombinations = await getAllResortSportCombinations();

		resortSportCombinations.forEach((combo) => {
			const regionPath = combo.regionSlug ? `/${combo.regionSlug}` : '';
			const sportPath = `${combo.sportSlug}-instructors`;
			urls.push(
				urlEntry(
					`/resorts/${combo.countrySlug}${regionPath}/${combo.resortSlug}/${sportPath}`,
					'0.9',
					'daily',
					today
				)
			);
		});

		// Build sitemap XML
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('')}
</urlset>`;

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
};
