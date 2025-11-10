import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getResortDetails } from '$src/lib/server/services/seoLandingService';

export const load: PageServerLoad = async ({ params }) => {
	const { country, region, resort } = params;

	const resortData = await getResortDetails(country, region, resort);

	if (!resortData) {
		error(404, 'Resort not found');
	}

	const { resort: resortInfo, location, sportsAvailable, nearbyResorts } = resortData;

	// SEO metadata
	const title = `${resortInfo.name} Ski Resort | Find Instructors & Book Lessons`;
	const description = `Discover ${resortInfo.name} in ${location.region?.region || location.country.country}. ${resortInfo.minElevation && resortInfo.maxElevation ? `Slopes from ${resortInfo.minElevation}m to ${resortInfo.maxElevation}m.` : ''} Book professional ski and snowboard instructors for private lessons.`;

	const canonicalUrl = `https://localsnow.com/resorts/${country}/${region}/${resort}`;

	// Breadcrumbs
	const breadcrumbs = [
		{ name: 'Home', url: 'https://localsnow.com' },
		{ name: 'Resorts', url: 'https://localsnow.com/resorts' },
		{ name: location.country.country, url: `https://localsnow.com/resorts/${country}` },
		{ name: location.region?.region || location.country.country, url: `https://localsnow.com/resorts/${country}/${region}` },
		{ name: resortInfo.name, url: canonicalUrl }
	];

	// Structured data - SkiResort
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'SkiResort',
		name: resortInfo.name,
		description: description,
		address: {
			'@type': 'PostalAddress',
			addressCountry: location.country.countryCode,
			addressRegion: location.region?.region
		},
		geo: resortInfo.lat && resortInfo.lon ? {
			'@type': 'GeoCoordinates',
			latitude: resortInfo.lat,
			longitude: resortInfo.lon
		} : undefined,
		url: canonicalUrl,
		...(resortInfo.website ? { sameAs: resortInfo.website } : {}),
		...(resortInfo.minElevation && resortInfo.maxElevation ? {
			elevation: {
				'@type': 'QuantitativeValue',
				minValue: resortInfo.minElevation,
				maxValue: resortInfo.maxElevation,
				unitCode: 'MTR'
			}
		} : {})
	};

	return {
		resort: resortInfo,
		location,
		sportsAvailable,
		nearbyResorts,
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
				image: 'https://localsnow.com/og-image.jpg'
			}
		}
	};
};
