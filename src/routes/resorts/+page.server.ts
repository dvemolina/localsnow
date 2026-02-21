import type { PageServerLoad } from './$types';
import { db } from '$src/lib/server/db/index';
import { resorts, countries, users, instructorResorts, userRoles } from '$src/lib/server/db/schema';
import { eq, sql, isNull, and, desc, inArray } from 'drizzle-orm';
import { extractLocale, type Locale } from '$lib/i18n/routes';
import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

const PRIMARY_ORIGIN = 'https://localsnow.org';

export const load: PageServerLoad = async ({ url }) => {
	// Query all countries that have at least one resort, with resort and instructor counts
	const countriesData = await db
		.select({
			id: countries.id,
			country: countries.country,
			countrySlug: countries.countrySlug,
			countryCode: countries.countryCode,
			resortCount: sql<number>`cast(count(distinct ${resorts.id}) as integer)`,
			instructorCount: sql<number>`cast(count(distinct ${users.id}) as integer)`
		})
		.from(countries)
		.innerJoin(resorts, eq(resorts.countryId, countries.id))
		.leftJoin(instructorResorts, eq(resorts.id, instructorResorts.resortId))
		.leftJoin(
			userRoles,
			and(
				eq(instructorResorts.instructorId, userRoles.userId),
				inArray(userRoles.role, ['instructor-independent', 'instructor-school'])
			)
		)
		.leftJoin(users, and(eq(userRoles.userId, users.id), isNull(users.deletedAt)))
		.groupBy(countries.id, countries.country, countries.countrySlug, countries.countryCode)
		.orderBy(desc(sql`count(distinct ${resorts.id})`), countries.country);

	const totalResorts = countriesData.reduce((sum, c) => sum + c.resortCount, 0);

	const { locale } = extractLocale(url.pathname);
	const currentLocale = (locale || 'en') as Locale;
	const canonicalPath = route('/resorts', currentLocale);
	const canonicalUrl = `${PRIMARY_ORIGIN}${canonicalPath}`;
	const alternates = getAlternateUrls(canonicalPath).map((alt) => ({
		locale: alt.locale,
		url: `${PRIMARY_ORIGIN}${alt.url}`
	}));

	return {
		countries: countriesData,
		totalCountries: countriesData.length,
		totalResorts,
		seo: {
			title: 'Ski Resorts Worldwide | Find Instructors at Top Ski Resorts',
			description: `Browse ski resorts across ${countriesData.length} countries worldwide. Find professional ski and snowboard instructors at resorts around the world.`,
			canonicalUrl,
			alternates
		}
	};
};
