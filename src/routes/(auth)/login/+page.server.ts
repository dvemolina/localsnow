import { userLoginSchema } from "$src/features/Users/lib/validations/authSchema.js";
import type { PageServerLoad } from "./$types.js";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

 
export const load: PageServerLoad = async (event) => {
    const form = await superValidate(zod(userLoginSchema))
    const redirectMessage = event.url.searchParams.get('redirectMessage') ?? null;
  
    return { form, redirectMessage };
};