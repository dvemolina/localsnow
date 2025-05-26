import { userLoginSchema } from "$src/features/Users/lib/validations/userSchemas.js";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { getClientIP, verifyPasswordHash } from "$src/lib/utils/auth.js";
import { RefillingTokenBucket, Throttler } from "$src/lib/server/rate-limit.js";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$src/lib/server/session.js";
import { UserService } from "$src/features/Users/lib/UserService.js";

const userService = new UserService();

const throttler = new Throttler<number>([0, 1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

 
export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    if(user) redirect(302, '/dashboard')
    const form = await superValidate(zod(userLoginSchema))
    const redirectMessage = event.url.searchParams.get('redirectMessage') ?? null;
  
    return { form, redirectMessage };
};

export const actions: Actions = {
    default: async (event) => {

        const clientIP = getClientIP(event);
        
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests",
                email: ""
            });
        }

        const form = await superValidate(event.request, zod(userLoginSchema));
                
            if (!form.valid) {
                return fail(400, { form })
            }
        
        const user = await userService.getUserByEmail(form.data.email);
        if (!user) {
             return setError(form, 'email', "User doesn't exist",  {status: 409})
            }

        if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests",
                email: ""
            });
        }
        if (!throttler.consume(user.id)) {
            return fail(429, {
                message: "Too many requests",
                email: ""
            });
        }
        const passwordHash = user.passwordHash;
        if(!passwordHash && user.googleId) {
            return setError(form, 'email', 'Email associated with Google Account Access',  {status: 409})
        }
        if (passwordHash) {
            const validPassword = await verifyPasswordHash(form.data.password, passwordHash);
            if (!validPassword) {
                return setError(form, 'password', 'Incorrect password',  {status: 409})
            }
        }

        throttler.reset(user.id);
        
        const sessionToken = await generateSessionToken();
        const session = await createSession(sessionToken, user.id);
        await setSessionTokenCookie(event, sessionToken, session.expiresAt);

        return redirect(302, "/dashboard");
            
    }
};  