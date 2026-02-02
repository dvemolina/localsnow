import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCountryDetails } from '$lib/server/services/seoLandingService';
import { extractLocale, type Locale } from '$lib/i18n/routes';
import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

const PRIMARY_ORIGIN = 'https://localsnow.org';

export const load: PageServerLoad = async ({ params, url }) => {
  const { country } = params;

  const countryData = await getCountryDetails(country);

  if (!countryData) {
    error(404, 'Country not found');
  }

  // Generate SEO metadata
  const { locale } = extractLocale(url.pathname);
  const currentLocale = (locale || 'en') as Locale;
  const resortsBase = route('/resorts', currentLocale);
  const canonicalPath = `${resortsBase}/${country}`;
  const canonicalUrl = `${PRIMARY_ORIGIN}${canonicalPath}`;
  const alternates = getAlternateUrls(canonicalPath).map((alt) => ({
    locale: alt.locale,
    url: `${PRIMARY_ORIGIN}${alt.url}`
  }));
  const title = `Ski Resorts in ${countryData.country.country} | LocalSnow`;
  const description = `Browse ${countryData.totalResorts} ski resorts across ${countryData.country.country}. Find ski and snowboard instructors at top resorts.`;

  return {
    countryData,
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
