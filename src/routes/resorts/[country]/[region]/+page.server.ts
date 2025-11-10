import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRegionDetails } from '$lib/server/services/seoLandingService';

export const load: PageServerLoad = async ({ params }) => {
  const { country, region } = params;

  const regionData = await getRegionDetails(country, region);

  if (!regionData) {
    error(404, 'Region not found');
  }

  // Generate SEO metadata
  const canonicalUrl = `https://localsnow.com/resorts/${country}/${region}`;
  const title = `Ski Resorts in ${regionData.region.region}, ${regionData.country.country} | LocalSnow`;
  const description = `Explore ${regionData.totalResorts} ski resorts in ${regionData.region.region}. Find local ski and snowboard instructors.`;

  return {
    regionData,
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
