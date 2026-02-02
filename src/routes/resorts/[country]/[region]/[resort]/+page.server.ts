import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getResortDetails } from '$src/lib/server/services/seoLandingService';
import { extractLocale, type Locale } from '$lib/i18n/routes';
import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';
import en from '$lib/i18n/translations/en.json';
import es from '$lib/i18n/translations/es.json';

const translationsByLocale: Record<Locale, Record<string, string>> = { en, es };
const PRIMARY_ORIGIN = 'https://localsnow.org';

function translate(locale: Locale, key: string, values?: Record<string, string | number>) {
	const template = translationsByLocale[locale]?.[key] ?? translationsByLocale.en?.[key] ?? key;
	if (!values) return template;
	return Object.entries(values).reduce(
		(result, [name, value]) => result.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
		template
	);
}

export const load: PageServerLoad = async ({ params, url }) => {
	const { country, region, resort } = params;
	const { locale } = extractLocale(url.pathname);
	const currentLocale = (locale || 'en') as Locale;

	const resortData = await getResortDetails(country, region, resort);

	if (!resortData) {
		error(404, 'Resort not found');
	}

	const { resort: resortInfo, location, sportsAvailable, nearbyResorts } = resortData;

	// SEO metadata
	const elevationText = resortInfo.minElevation && resortInfo.maxElevation
		? `${translate(currentLocale, 'resort_page_seo_elevation', {
				min: resortInfo.minElevation,
				max: resortInfo.maxElevation
			})} `
		: '';
	const title = translate(currentLocale, 'resort_page_seo_title', {
		resort: resortInfo.name
	});
	const description = translate(currentLocale, 'resort_page_seo_description', {
		resort: resortInfo.name,
		region: location.region?.region || location.country.country,
		elevation: elevationText
	});

	const resortsBase = route('/resorts', currentLocale);
	const canonicalPath = `${resortsBase}/${country}/${region}/${resort}`;
	const canonicalUrl = `${PRIMARY_ORIGIN}${canonicalPath}`;
	const alternates = getAlternateUrls(canonicalPath).map((alt) => ({
		locale: alt.locale,
		url: `${PRIMARY_ORIGIN}${alt.url}`
	}));

	// Breadcrumbs
	const breadcrumbs = [
		{ name: translate(currentLocale, 'nav_home'), url: `${PRIMARY_ORIGIN}${route('/', currentLocale)}` },
		{ name: translate(currentLocale, 'nav_resorts'), url: `${PRIMARY_ORIGIN}${resortsBase}` },
		{ name: location.country.country, url: `${PRIMARY_ORIGIN}${resortsBase}/${country}` },
		{ name: location.region?.region || location.country.country, url: `${PRIMARY_ORIGIN}${resortsBase}/${country}/${region}` },
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
			alternates,
			breadcrumbs,
			structuredData,
			openGraph: {
				title,
				description,
				url: canonicalUrl,
				type: 'website',
				image: 'https://localsnow.org/og-image.jpg'
			}
		}
	};
};
