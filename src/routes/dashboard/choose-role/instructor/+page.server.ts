import { schoolSignupSchema } from "$src/features/Schools/lib/validations/schoolSchemas";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { redirect, type Actions } from "@sveltejs/kit";
import { requireAuth } from "$src/lib/utils/auth";

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to choose a Role for your account');
    if (user.role) redirect(302, '/dashboard')
    const form = await superValidate(zod(schoolSignupSchema));
    
    return { form }
};

export const actions: Actions = {
    default: async (event)=> {
        const user = requireAuth(event, 'Login to choose a role for your account');

    }
};