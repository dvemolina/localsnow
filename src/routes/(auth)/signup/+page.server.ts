import { userSignupSchema } from "$src/features/Users/lib/validations/authSchema.js";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { UserService } from "$src/features/Users/lib/UserService.js";

const userService = new UserService()
 
export const load: PageServerLoad = async () => {
    const form = await superValidate(zod(userSignupSchema));
    
    return { form }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod(userSignupSchema));
        
        if (!form.valid) {
        return fail(400, { form })
        }

        const emailExists = await userService.getUserByEmail(form.data.email);
        if(emailExists) {
            return setError(form, 'email', 'Este correo ya existe',  {status: 409})
        }

        try {
            await userService.createUser(form.data);
        } catch (error) {
            console.error('Something went wrong creating a user with email/password: ', error)
            return fail(500, { form, error: 'Internal server error while creating the user. Try again later' });
        }
        
        redirect(302, '/dashboard')
        
    }
};  