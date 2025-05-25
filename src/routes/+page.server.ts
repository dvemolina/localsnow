import { heroResortSearchSchema } from "$src/features/Resorts/lib/resortSchemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async () => {
   const form = await superValidate(zod(heroResortSearchSchema)); 
   return { form }
};