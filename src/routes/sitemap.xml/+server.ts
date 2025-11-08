// src/routes/sitemap.xml/+server.ts
import { ResortsService } from '$src/features/Resorts/lib/ResortsService';
import { SportsService } from '$src/features/Sports/lib/sportsService';
import { db } from '$lib/server/db';
import { countries, regions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const BASE_URL = 'https://localsnow.com';

const resortsService = new ResortsService();
const sportsService = new SportsService();

export async function GET() {
	try {
		// Fetch all data needed for sitemap
		const [allResorts, allSports, allCountries, allRegions] = await Promise.all([
			resortsService.getAllResorts(),
			sportsService.getAllSports(),
			db.select().from(countries),
			db.select().from(regions)
		]);

		// Create maps for quick lookups
		const countryMap = new Map(allCountries.map((c) => [c.id, c]));
		const regionMap = new Map(allRegions.map((r) => [r.id, r]));

		// Generate URLs
		const urls: Array<{
			loc: string;
			lastmod?: string;
			changefreq?: string;
			priority?: string;
		}> = [];

		// Static pages (highest priority)
		urls.push({
			loc: BASE_URL,
			changefreq: 'daily',
			priority: '1.0'
		});

		urls.push({
			loc: `${BASE_URL}/instructors`,
			changefreq: 'daily',
			priority: '0.9'
		});

		urls.push({
			loc: `${BASE_URL}/about`,
			changefreq: 'monthly',
			priority: '0.5'
		});

		urls.push({
			loc: `${BASE_URL}/contact`,
			changefreq: 'monthly',
			priority: '0.5'
		});

		// Generate resort + sport combination URLs (high priority for SEO)
		for (const resort of allResorts) {
			const country = countryMap.get(resort.countryId);
			const region = regionMap.get(resort.regionId);

			if (!country || !region) {
				console.warn(`Missing country or region for resort ${resort.name}`);
				continue;
			}

			// For each sport, create a URL
			for (const sport of allSports) {
				urls.push({
					loc: `${BASE_URL}/${country.countrySlug}/${region.regionSlug}/${resort.slug}/${sport.slug}`,
					changefreq: 'weekly',
					priority: '0.8'
				});
			}
		}

		// Build XML
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`
	)
	.join('\n')}
</urlset>`;

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
}
