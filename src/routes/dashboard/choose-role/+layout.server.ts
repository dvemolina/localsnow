import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { requireAuth } from "$src/lib/utils/auth";

export const load: LayoutServerLoad = async (event) => {
    const auth = requireAuth(event, 'Login to choose your Account Type')
    const user = auth.user
    if(user.role) redirect(302, '/dashboard')
    
    return { user }
};