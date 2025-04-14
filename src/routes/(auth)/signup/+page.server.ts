import { userSignupSchema } from "$src/features/Users/lib/validations/userSchemas.js";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { UserService } from "$src/features/Users/lib/UserService.js";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit.js";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$src/lib/server/session.js";
import { getClientIP } from "$src/lib/utils/auth.js";
import { sendSignupEmail } from "$src/lib/server/webhooks/email-n8n.js";

const userService = new UserService()
const ipBucket = new RefillingTokenBucket<string>(3, 10);
 
export const load: PageServerLoad = async () => {
    const form = await superValidate(zod(userSignupSchema));
    
    return { form }
};

export const actions: Actions = {
    default: async (event) => {

        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests"
            });
        }
        const form = await superValidate(event.request, zod(userSignupSchema));
        
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
        
        let user;
        try {
           user =  await userService.createUserWithPassword(form.data);
           await sendSignupEmail(user.name, user.email)
        } catch (error) {
            console.error('Something went wrong creating a user with email/password: ', error)
            return fail(500, { form, error: 'Internal server error while creating the user. Try again later' });
        }

        const sessionToken = await generateSessionToken();
        const session = await createSession(sessionToken, user.id);
        await setSessionTokenCookie(event, sessionToken, session.expiresAt);
        
        return redirect(302, '/dashboard')
        
    }
};  