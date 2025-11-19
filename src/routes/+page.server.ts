import { heroResortSearchSchema } from "$src/features/Resorts/lib/resortSchemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from '$lib/server/db';
import { countries } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import { extractLocaleFromRequest, localizeHref } from '$lib/paraglide/runtime';


export const load: PageServerLoad = async () => {
   const form = await superValidate(zod(heroResortSearchSchema));

   // Get Spain's country ID for resort filtering (case-insensitive)
   const spainCountry = await db
       .select({ id: countries.id })
       .from(countries)
       .where(sql`UPPER(${countries.countryCode}) = 'ES'`)
       .limit(1);
   const spainCountryId = spainCountry[0]?.id;

   return { form, spainCountryId }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod(heroResortSearchSchema));

        if (!form.valid) {
            return { form };
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (form.data.resort) params.set('resort', form.data.resort.toString());
        if (form.data.sport) params.set('sport', form.data.sport);

        // Get current locale and redirect to localized instructors page
        const locale = extractLocaleFromRequest(request);
        const localizedUrl = localizeHref(`/instructors?${params.toString()}`, { locale });
        throw redirect(303, localizedUrl);
    }
};