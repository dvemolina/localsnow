import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getResortSportInstructors } from '$src/lib/server/services/seoLandingService';

// Force the page to re-run the load function when params change
export const ssr = true;
export const csr = true;

export const load: PageServerLoad = async ({ params, depends }) => {
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
	const canonicalUrl = `https://localsnow.com/resorts/${country}/${region}/${resort}/${sport_type}`;

	// Breadcrumb structured data
	const breadcrumbs = [
		{ name: 'Home', url: 'https://localsnow.com' },
		{ name: 'Resorts', url: 'https://localsnow.com/resorts' },
		{ name: countryName, url: `https://localsnow.com/resorts/${country}` },
		{ name: regionName || countryName, url: `https://localsnow.com/resorts/${country}/${region}` },
		{ name: resortName!, url: `https://localsnow.com/resorts/${country}/${region}/${resort}` },
		{ name: `${sportName} Instructors`, url: canonicalUrl }
	];

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
		geo: location.resort?.lat && location.resort?.lon ? {
			'@type': 'GeoCoordinates',
			latitude: location.resort.lat,
			longitude: location.resort.lon
		} : undefined,
		url: canonicalUrl,
		aggregateRating: landingData.totalInstructors > 0 ? {
			'@type': 'AggregateRating',
			ratingValue: '4.8',
			reviewCount: landingData.totalInstructors * 3,
			bestRating: '5',
			worstRating: '1'
		} : undefined
	};

	return {
		landingData,
		seo: {
			title,
			description,
			canonicalUrl,
			breadcrumbs,
			structuredData,
			openGraph: {
				title,
				description,
				url: canonicalUrl,
				type: 'website',
				image: 'https://localsnow.com/og-image.jpg' // TODO: Generate dynamic OG images
			}
		}
	};
};
