import { redirect, type Actions } from "@sveltejs/kit";
import { requireAuth } from "$src/lib/utils/auth";
import { UserService } from "$src/features/Users/lib/UserService";
import type { PageServerLoad } from "./$types";
import { getRoles } from "$src/lib/utils/roles";
import { db } from "$lib/server/db";
import { userRoles } from "$src/lib/server/db/schema";

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
    if (getRoles(user).length > 0) {
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
        await db.insert(userRoles).values({ userId: user.id, role: 'client' }).onConflictDoNothing();

        // Use throw redirect to ensure execution stops
        throw redirect(303, `/${locale}/dashboard`);
    }
};
