import { heroResortSearchSchema } from "$src/features/Resorts/lib/resortSchemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Locale } from '$lib/i18n/routes';

const locales: Locale[] = ['en', 'es'];
const baseLocale: Locale = 'en';
const isLocale = (locale: string): locale is Locale => locales.includes(locale as Locale);


export const load: PageServerLoad = async () => {
   const form = await superValidate(zod(heroResortSearchSchema));
   return { form };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const form = await superValidate(formData, zod(heroResortSearchSchema));

        console.log('🏠 [Homepage Action] Form submitted:', {
            valid: form.valid,
            data: form.data,
            rawFormData: Object.fromEntries(formData.entries())
        });

        if (!form.valid) {
            console.log('❌ [Homepage Action] Form validation failed:', form.errors);
            return { form };
        }

        // Get locale from hidden form field
        const localeField = formData.get('locale')?.toString() || '';
        const locale = isLocale(localeField) ? localeField : baseLocale;

        // Get search type (instructors or schools)
        const searchType = formData.get('searchType')?.toString() || 'instructors';

        console.log('🔧 [Homepage Action] Processing:', { locale, searchType });

        // Build query parameters
        const params = new URLSearchParams();
        if (form.data.resort) params.set('resort', form.data.resort.toString());
        if (form.data.sport) params.set('sport', form.data.sport);

        console.log('🔗 [Homepage Action] Built params:', params.toString());

        // Build localized redirect URL based on search type
        const targetPath = searchType === 'schools' ? '/schools' : '/instructors';
        const basePath = `${targetPath}?${params.toString()}`;
        const localizedUrl = locale === baseLocale ? basePath : `/${locale}${basePath}`;

        console.log('🚀 [Homepage Action] Redirecting to:', localizedUrl);

        throw redirect(303, localizedUrl);
    }
};
