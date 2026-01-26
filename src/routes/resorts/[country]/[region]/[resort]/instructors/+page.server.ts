import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getResortInstructors, getFAQsByEntity } from '$src/lib/server/services/seoLandingService';

export const load: PageServerLoad = async ({ params }) => {
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

	const canonicalUrl = `https://localsnow.org/resorts/${country}/${region}/${resort}/instructors`;

	// Breadcrumbs
	const breadcrumbs = [
		{ name: 'Home', url: 'https://localsnow.org' },
		{ name: 'Resorts', url: 'https://localsnow.org/resorts' },
		{ name: location.country.country, url: `https://localsnow.org/resorts/${country}` },
		{ name: location.region?.region || location.country.country, url: `https://localsnow.org/resorts/${country}/${region}` },
		{ name: location.resort?.name!, url: `https://localsnow.org/resorts/${country}/${region}/${resort}` },
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
