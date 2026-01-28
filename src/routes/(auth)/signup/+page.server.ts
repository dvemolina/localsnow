import { userSignupSchema } from "$src/features/Users/lib/validations/userSchemas.js";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { UserService } from "$src/features/Users/lib/UserService.js";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit.js";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$src/lib/server/session.js";
import { getClientIP } from "$src/lib/utils/auth.js";
import { sendSignupEmail } from "$src/lib/server/webhooks/n8n/email-n8n.js";
import { TURNSTILE_SECRET_KEY } from "$src/lib/server/config.js";

const userService = new UserService()
const ipBucket = new RefillingTokenBucket<string>(3, 10);

// Helper to get locale from URL path
function getLocaleFromPath(pathname: string): string {
    const match = pathname.match(/^\/(en|es)\//);
    return match ? match[1] : 'en';
}

export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    if(user) {
        const locale = getLocaleFromPath(event.url.pathname);
        redirect(302, `/${locale}/dashboard`);
    }

    const form = await superValidate(zod(userSignupSchema));

    return { form }
};

async function verifyTurnstileToken(token: string, ip: string | null): Promise<boolean> {
    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (ip) {
        formData.append('remoteip', ip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    return result.success === true;
}

export const actions: Actions = {
    default: async (event) => {

        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            return fail(429, {
                message: "Too many requests"
            });
        }

        // Clone the request to read form data for Turnstile, then pass original to superValidate
        const clonedRequest = event.request.clone();
        const formData = await clonedRequest.formData();
        const turnstileToken = formData.get('cf-turnstile-response') as string;

        if (!turnstileToken) {
            return fail(400, {
                message: "Please complete the security check"
            });
        }

        const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIP);
        if (!turnstileValid) {
            return fail(400, {
                message: "Security verification failed. Please try again."
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

        const locale = getLocaleFromPath(event.url.pathname);
        const returnTo = event.url.searchParams.get('returnTo') || `/${locale}/dashboard`;
        return redirect(302, returnTo);

    }
};  