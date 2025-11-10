import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCountryDetails } from '$lib/server/services/seoLandingService';

export const load: PageServerLoad = async ({ params }) => {
  const { country } = params;

  const countryData = await getCountryDetails(country);

  if (!countryData) {
    error(404, 'Country not found');
  }

  // Generate SEO metadata
  const canonicalUrl = `https://localsnow.com/resorts/${country}`;
  const title = `Ski Resorts in ${countryData.country.country} | LocalSnow`;
  const description = `Browse ${countryData.totalResorts} ski resorts across ${countryData.country.country}. Find ski and snowboard instructors at top resorts.`;

  return {
    countryData,
    seo: {
      title,
      description,
      canonicalUrl,
      openGraph: {
        type: 'website',
        url: canonicalUrl,
        title,
        description
      }
    }
  };
};
