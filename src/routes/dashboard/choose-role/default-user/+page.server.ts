import { redirect, type Actions } from "@sveltejs/kit";
import { requireAuth } from "$src/lib/utils/auth";
import { UserService } from "$src/features/Users/lib/UserService";
import type { PageServerLoad } from "./$types";

const userService = new UserService();

// Helper to get locale from URL path
function getLocaleFromPath(pathname: string): string {
    const match = pathname.match(/^\/(en|es)\//);
    return match ? match[1] : 'en';
}

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to choose a Role for your account');
    const locale = getLocaleFromPath(event.url.pathname);

    // If user already has a role, redirect to dashboard
    if (user.role) {
        redirect(302, `/${locale}/dashboard`);
    }

    return { user };
};

export const actions: Actions = {
    default: async (event) => {
        const user = requireAuth(event, 'Session Expired. Login again to proceed');
        const locale = getLocaleFromPath(event.url.pathname);

        // Update user role to 'client'
        await userService.updateUser(user.id, {
            role: 'client',
            updatedAt: new Date()
        });

        // Use throw redirect to ensure execution stops
        throw redirect(303, `/${locale}/dashboard`);
    }
};
