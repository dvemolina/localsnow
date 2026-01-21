import { heroResortSearchSchema } from "$src/features/Resorts/lib/resortSchemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Locale } from '$lib/i18n/routes';
import { db } from '$lib/server/db';
import { schools, schoolResorts, resorts, regions, countries, schoolInstructors } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const locales: Locale[] = ['en', 'es'];
const baseLocale: Locale = 'en';
const isLocale = (locale: string): locale is Locale => locales.includes(locale as Locale);


export const load: PageServerLoad = async () => {
   const form = await superValidate(zod(heroResortSearchSchema));

   try {
      // Fetch featured schools (verified, published schools)
      const featuredSchoolsBase = await db
         .select({
            id: schools.id,
            name: schools.name,
            slug: schools.slug,
            bio: schools.bio,
            logo: schools.logo,
            isVerified: schools.isVerified,
            resortName: resorts.name,
            resortSlug: resorts.slug,
            regionName: regions.region,
            countryName: countries.country
         })
         .from(schools)
         .innerJoin(schoolResorts, eq(schools.id, schoolResorts.schoolId))
         .innerJoin(resorts, eq(schoolResorts.resortId, resorts.id))
         .leftJoin(regions, eq(resorts.regionId, regions.id))
         .innerJoin(countries, eq(resorts.countryId, countries.id))
         .where(and(
            eq(schools.isPublished, true),
            eq(schools.isVerified, true)
         ))
         .limit(20); // Get more schools initially

      // Count instructors for each school
      const schoolsWithCounts = await Promise.all(
         featuredSchoolsBase.map(async (school) => {
            const instructorCount = await db
               .select({ count: schoolInstructors.instructorId })
               .from(schoolInstructors)
               .where(and(
                  eq(schoolInstructors.schoolId, school.id),
                  eq(schoolInstructors.isAcceptedBySchool, true),
                  eq(schoolInstructors.isActive, true)
               ));

            return {
               ...school,
               instructorCount: instructorCount.length
            };
         })
      );

      // Sort by instructor count and take top 4
      const featuredSchools = schoolsWithCounts
         .sort((a, b) => b.instructorCount - a.instructorCount)
         .slice(0, 4);

      return {
         form,
         featuredSchools
      };
   } catch (error) {
      console.error('Error loading homepage data:', error);
      return {
         form,
         featuredSchools: []
      };
   }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const form = await superValidate(formData, zod(heroResortSearchSchema));

        if (!form.valid) {
            return { form };
        }

        // Get locale from hidden form field
        const localeField = formData.get('locale')?.toString() || '';
        const locale = isLocale(localeField) ? localeField : baseLocale;

        // Get search type (instructors or schools)
        const searchType = formData.get('searchType')?.toString() || 'instructors';

        // Build query parameters
        const params = new URLSearchParams();
        if (form.data.resort) params.set('resort', form.data.resort.toString());
        if (form.data.sport) params.set('sport', form.data.sport);

        // Build localized redirect URL based on search type
        const targetPath = searchType === 'schools' ? '/schools' : '/instructors';
        const basePath = `${targetPath}?${params.toString()}`;
        const localizedUrl = locale === baseLocale ? basePath : `/${locale}${basePath}`;
        throw redirect(303, localizedUrl);
    }
};
