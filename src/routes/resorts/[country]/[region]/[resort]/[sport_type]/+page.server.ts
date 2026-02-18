import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getResortSportInstructors } from '$src/lib/server/services/seoLandingService';
import { extractLocale, type Locale } from '$lib/i18n/routes';
import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

const PRIMARY_ORIGIN = 'https://localsnow.org';

// Force the page to re-run the load function when params change
export const ssr = true;
export const csr = true;

export const load: PageServerLoad = async ({ params, depends, url }) => {
	// This tells SvelteKit to re-run this function when these params change
	depends(`resort:${params.resort}`);
	depends(`sport:${params.sport_type}`);

	const { country, region, resort, sport_type } = params;

	// Validate sport_type format (must end with -instructors)
	if (!sport_type.endsWith('-instructors')) {
		error(404, 'Page not found');
	}

	// Extract sport slug (e.g., "ski-instructors" -> "ski")
	const sportSlug = sport_type.replace('-instructors', '');

	// Validate sport slug (only allow valid sports)
	const validSports = ['ski', 'snowboard', 'telemark'];
	if (!validSports.includes(sportSlug)) {
		error(404, 'Invalid sport');
	}

	// Fetch landing page data
	const landingData = await getResortSportInstructors(country, region, resort, sportSlug);

	if (!landingData) {
		error(404, 'Location not found');
	}

	// Generate SEO metadata
	const { location, sport } = landingData;
	const resortName = location.resort?.name;
	const regionName = location.region?.region;
	const countryName = location.country.country;
	const sportName = sport.sport;

	const title = `${sportName} Instructors in ${resortName} | Book Private Lessons`;
	const description = `Find and book professional ${sportName.toLowerCase()} instructors in ${resortName}, ${regionName || countryName}. ${landingData.totalInstructors} verified instructors available for private lessons.`;

	// Canonical URL
	const { locale } = extractLocale(url.pathname);
	const currentLocale = (locale || 'en') as Locale;
	const resortsBase = route('/resorts', currentLocale);
	const canonicalPath = `${resortsBase}/${country}/${region}/${resort}/${sport_type}`;
	const canonicalUrl = `${PRIMARY_ORIGIN}${canonicalPath}`;
	const alternates = getAlternateUrls(canonicalPath).map((alt) => ({
		locale: alt.locale,
		url: `${PRIMARY_ORIGIN}${alt.url}`
	}));

	// Breadcrumb structured data
	const breadcrumbs = [
		{ name: 'Home', url: `${PRIMARY_ORIGIN}${route('/', currentLocale)}` },
		{ name: 'Resorts', url: `${PRIMARY_ORIGIN}${resortsBase}` },
		{ name: countryName, url: `${PRIMARY_ORIGIN}${resortsBase}/${country}` },
		{
			name: regionName || countryName,
			url: `${PRIMARY_ORIGIN}${resortsBase}/${country}/${region}`
		},
		{ name: resortName!, url: `${PRIMARY_ORIGIN}${resortsBase}/${country}/${region}/${resort}` },
		{ name: `${sportName} Instructors`, url: canonicalUrl }
	];

	// Only emit aggregate rating when real reviews exist.
	const reviewAggregate = landingData.instructors.reduce(
		(acc, instructor) => {
			const stats = instructor.reviewStats;
			if (!stats || stats.totalReviews <= 0 || stats.averageRating <= 0) {
				return acc;
			}

			acc.totalReviews += stats.totalReviews;
			acc.weightedRatingSum += stats.averageRating * stats.totalReviews;
			return acc;
		},
		{ totalReviews: 0, weightedRatingSum: 0 }
	);

	const aggregateRating =
		reviewAggregate.totalReviews > 0
			? {
					'@type': 'AggregateRating',
					ratingValue: Number(
						(reviewAggregate.weightedRatingSum / reviewAggregate.totalReviews).toFixed(2)
					),
					reviewCount: reviewAggregate.totalReviews,
					bestRating: 5,
					worstRating: 1
				}
			: undefined;

	// LocalBusiness structured data
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		name: `${resortName} ${sportName} Instructors`,
		description: description,
		address: {
			'@type': 'PostalAddress',
			addressCountry: location.country.countryCode,
			addressRegion: regionName
		},
		geo:
			location.resort?.lat && location.resort?.lon
				? {
						'@type': 'GeoCoordinates',
						latitude: location.resort.lat,
						longitude: location.resort.lon
					}
				: undefined,
		url: canonicalUrl,
		aggregateRating
	};

	return {
		landingData,
		seo: {
			title,
			description,
			canonicalUrl,
			alternates,
			breadcrumbs,
			structuredData,
			openGraph: {
				title,
				description,
				url: canonicalUrl,
				type: 'website',
				image: 'https://localsnow.org/og-image.jpg' // TODO: Generate dynamic OG images
			}
		}
	};
};
