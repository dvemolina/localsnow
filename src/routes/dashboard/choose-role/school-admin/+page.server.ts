import { schoolSignupSchema } from "$src/features/Schools/lib/validations/schoolSchemas";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";

export const load: PageServerLoad = async () => {
    const form = await superValidate(zod(schoolSignupSchema));
    
    return { form }
};