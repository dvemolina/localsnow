import { heroResortSearchSchema } from "$src/features/Resorts/lib/resortSchemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { baseLocale, isLocale } from '$lib/paraglide/runtime';


export const load: PageServerLoad = async () => {
   const form = await superValidate(zod(heroResortSearchSchema));

   // No country filtering - support worldwide resorts
   return { form }
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

        // Build query parameters
        const params = new URLSearchParams();
        if (form.data.resort) params.set('resort', form.data.resort.toString());
        if (form.data.sport) params.set('sport', form.data.sport);

        // Build localized redirect URL
        const basePath = `/instructors?${params.toString()}`;
        const localizedUrl = locale === baseLocale ? basePath : `/${locale}${basePath}`;
        throw redirect(303, localizedUrl);
    }
};
