import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { redirect, type Actions } from "@sveltejs/kit";
import { getClientIP, requireAuth } from "$src/lib/utils/auth";
import { UserService } from "$src/features/Users/lib/UserService";
import { RefillingTokenBucket } from "$src/lib/server/rate-limit";
import { instructorSignupSchema } from "$src/features/Instructors/lib/instructorSchemas";

const userService = new UserService();
const ipBucket = new RefillingTokenBucket<string>(3, 10);

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to choose a Role for your account');
    if (user.role) redirect(302, '/dashboard')
    const form = await superValidate(zod(instructorSignupSchema));
    
    return { form }
};

export const actions: Actions = {
    default: async (event)=> {
        console.log('Server Hit!');
        const form = await superValidate(event.request, zod(instructorSignupSchema));
        console.log('Received Form: ', form)

        const clientIP = getClientIP(event);
        if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
            console.log('Too many requests from same IP')
            return fail(429, {
                message: "Too many requests"
            });
        }
        
        
        if (!form.valid) {
            console.log('Invalid form: ', form)
            return fail(400, { form })
        }

        console.log('Sent Form: ', form)
        return { form }
    }
};