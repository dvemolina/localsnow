import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getResortSchools, getFAQsByEntity } from '$src/lib/server/services/seoLandingService';
import { extractLocale, type Locale } from '$lib/i18n/routes';
import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

const PRIMARY_ORIGIN = 'https://localsnow.org';

export const load: PageServerLoad = async ({ params, url }) => {
	const { country, region, resort } = params;

	const resortData = await getResortSchools(country, region, resort);

	if (!resortData) {
		error(404, 'Resort not found');
	}

	const { location, schools, totalSchools } = resortData;

	// Get FAQs for this resort
	const faqList = await getFAQsByEntity('resort', location.resort?.id);

	// SEO metadata
	const title = `Ski Schools in ${location.resort?.name} | Professional Instruction & Group Lessons`;
	const description = `Discover ${totalSchools} professional ski and snowboard schools in ${location.resort?.name}, ${location.region?.region || location.country.country}. Find the perfect ski school for group lessons, kids programs, and beginner courses.`;

	const { locale } = extractLocale(url.pathname);
	const currentLocale = (locale || 'en') as Locale;
	const resortsBase = route('/resorts', currentLocale);
	const canonicalPath = `${resortsBase}/${country}/${region}/${resort}/schools`;
	const canonicalUrl = `${PRIMARY_ORIGIN}${canonicalPath}`;
	const alternates = getAlternateUrls(canonicalPath).map((alt) => ({
		locale: alt.locale,
		url: `${PRIMARY_ORIGIN}${alt.url}`
	}));

	// Breadcrumbs
	const breadcrumbs = [
		{ name: 'Home', url: `${PRIMARY_ORIGIN}${route('/', currentLocale)}` },
		{ name: 'Resorts', url: `${PRIMARY_ORIGIN}${resortsBase}` },
		{ name: location.country.country, url: `${PRIMARY_ORIGIN}${resortsBase}/${country}` },
		{ name: location.region?.region || location.country.country, url: `${PRIMARY_ORIGIN}${resortsBase}/${country}/${region}` },
		{ name: location.resort?.name!, url: `${PRIMARY_ORIGIN}${resortsBase}/${country}/${region}/${resort}` },
		{ name: 'Schools', url: canonicalUrl }
	];

	// Structured data - ItemList of LocalBusinesses
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: `Ski Schools in ${location.resort?.name}`,
		description: description,
		numberOfItems: totalSchools,
		itemListElement: schools.slice(0, 10).map((school, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				'@type': 'LocalBusiness',
				name: school.name,
				description: school.bio || `Professional ski and snowboard instruction in ${location.resort?.name}`,
				url: `https://localsnow.org/schools/${school.slug}`,
				...(school.logo && {
					image: school.logo
				}),
				address: {
					'@type': 'PostalAddress',
					addressCountry: location.country.countryCode,
					addressRegion: location.region?.region,
					addressLocality: location.resort?.name
				}
			}
		}))
	};

	// FAQPage structured data
	const faqSchema = faqList.length > 0 ? {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqList.map(faq => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	} : null;

	return {
		location,
		schools,
		totalSchools,
		faqs: faqList,
		seo: {
			title,
			description,
			canonicalUrl,
			alternates,
			breadcrumbs,
			structuredData,
			faqSchema,
			openGraph: {
				title,
				description,
				url: canonicalUrl,
				type: 'website',
				image: location.resort?.image || 'https://localsnow.org/og-image.jpg'
			}
		}
	};
};
