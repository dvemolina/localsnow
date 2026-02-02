import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getResortInstructors, getFAQsByEntity } from '$src/lib/server/services/seoLandingService';
import { extractLocale, type Locale } from '$lib/i18n/routes';
import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

const PRIMARY_ORIGIN = 'https://localsnow.org';

export const load: PageServerLoad = async ({ params, url }) => {
	const { country, region, resort } = params;

	const resortData = await getResortInstructors(country, region, resort);

	if (!resortData) {
		error(404, 'Resort not found');
	}

	const { location, instructors, totalInstructors } = resortData;

	// Get FAQs for this resort
	const faqList = await getFAQsByEntity('resort', location.resort?.id);

	// SEO metadata
	const title = `Ski & Snowboard Instructors in ${location.resort?.name} | Book Private Lessons`;
	const description = `Find and book ${totalInstructors} professional ski and snowboard instructors in ${location.resort?.name}, ${location.region?.region || location.country.country}. Compare verified instructors, read reviews, and book direct with no commission.`;

	const { locale } = extractLocale(url.pathname);
	const currentLocale = (locale || 'en') as Locale;
	const resortsBase = route('/resorts', currentLocale);
	const canonicalPath = `${resortsBase}/${country}/${region}/${resort}/instructors`;
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
		{ name: 'Instructors', url: canonicalUrl }
	];

	// Structured data - LocalBusiness
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: `Ski & Snowboard Instructors in ${location.resort?.name}`,
		description: description,
		numberOfItems: totalInstructors,
		itemListElement: instructors.slice(0, 10).map((instructor, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				'@type': 'Person',
				name: `${instructor.name} ${instructor.lastName.charAt(0)}.`,
				jobTitle: 'Ski Instructor',
				url: `https://localsnow.org/instructors/${instructor.id}-${instructor.name.toLowerCase()}-${instructor.lastName.toLowerCase()}`,
				...(instructor.profileImageUrl && {
					image: instructor.profileImageUrl
				})
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
		instructors,
		totalInstructors,
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
