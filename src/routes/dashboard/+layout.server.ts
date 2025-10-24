// src/routes/dashboard/+layout.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access dashboard');
    
    // Redirect users without a role to choose-role page
    // But allow access to the choose-role routes themselves
    if (!user.role && !event.url.pathname.startsWith('/dashboard/choose-role')) {
        redirect(302, '/dashboard/choose-role');
    }
    
    return { user, profileVisits: 0 };
};