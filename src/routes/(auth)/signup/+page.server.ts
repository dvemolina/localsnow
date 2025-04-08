import { userSignupSchema } from "$src/features/Users/schemas/signupSchema.js";
import type { PageServerLoad } from "./$types.js";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
 
export const load: PageServerLoad = async () => {
    const form = await superValidate(zod(userSignupSchema))
  
    return {
    form
};
};