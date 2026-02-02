import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRegionDetails } from '$lib/server/services/seoLandingService';
import { extractLocale, type Locale } from '$lib/i18n/routes';
import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

const PRIMARY_ORIGIN = 'https://localsnow.org';

export const load: PageServerLoad = async ({ params, url }) => {
  const { country, region } = params;

  const regionData = await getRegionDetails(country, region);

  if (!regionData) {
    error(404, 'Region not found');
  }

  // Generate SEO metadata
  const { locale } = extractLocale(url.pathname);
  const currentLocale = (locale || 'en') as Locale;
  const resortsBase = route('/resorts', currentLocale);
  const canonicalPath = `${resortsBase}/${country}/${region}`;
  const canonicalUrl = `${PRIMARY_ORIGIN}${canonicalPath}`;
  const alternates = getAlternateUrls(canonicalPath).map((alt) => ({
    locale: alt.locale,
    url: `${PRIMARY_ORIGIN}${alt.url}`
  }));
  const title = `Ski Resorts in ${regionData.region.region}, ${regionData.country.country} | LocalSnow`;
  const description = `Explore ${regionData.totalResorts} ski resorts in ${regionData.region.region}. Find local ski and snowboard instructors.`;

  return {
    regionData,
    seo: {
      title,
      description,
      canonicalUrl,
      alternates,
      openGraph: {
        type: 'website',
        url: canonicalUrl,
        title,
        description
      }
    }
  };
};
