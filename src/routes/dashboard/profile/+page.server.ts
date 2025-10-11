import { userProfileSchema } from "$src/features/Users/lib/validations/userSchemas.js";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { UserService } from "$src/features/Users/lib/UserService.js";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit.js";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$src/lib/server/session.js";
import { getClientIP } from "$src/lib/utils/auth.js";

const userService = new UserService()
const ipBucket = new RefillingTokenBucket<string>(3, 10);
 
export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    if(!user) redirect(302, '/login')
    
    const form = await superValidate(zod(userProfileSchema));
    
    return { form }
};

export const actions: Actions = {
    default: async (event) => {
        const user = event.locals.user
        if(!user) redirect(302, '/login')

        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests"
            });
        }
        const form = await superValidate(event.request, zod(userProfileSchema));
        
        if (!form.valid) {
        return fail(400, { form })
        }

        const emailExists = await userService.getUserByEmail(form.data.email);
        if(emailExists) {
            return setError(form, 'email', 'Este correo ya existe',  {status: 409})
        }

        if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests"
            });
        }
        

        try {
           await userService.updateUser(user.id, form.data);
        } catch (error) {
            console.error('Something went wrong updating a user with email/password: ', error)
            return fail(500, { form, error: 'Internal server error while updating the user. Try again later' });
        }
        
        return redirect(302, '/profile')
        
    }
};  