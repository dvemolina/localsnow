import { heroResortSearchSchema } from "$src/features/Resorts/lib/resortSchemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async () => {
   const form = await superValidate(zod(heroResortSearchSchema));
   return { form }
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

        // Redirect to instructors page with filters
        throw redirect(303, `/instructors?${params.toString()}`);
    }
};