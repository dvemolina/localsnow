// src/routes/dashboard/+layout.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

// Helper to get locale from URL path
function getLocaleFromPath(pathname: string): string {
    const match = pathname.match(/^\/(en|es)\//);
    return match ? match[1] : 'en';
}

export const load: LayoutServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access dashboard');

    // Redirect users without a role to choose-role page
    // But allow access to the choose-role routes themselves
    // Check for both English and Spanish routes
    const pathname = event.url.pathname;
    const isChooseRolePath = pathname.includes('/dashboard/choose-role') || pathname.includes('/panel/elegir-rol');

    if (!user.role && !isChooseRolePath) {
        const locale = getLocaleFromPath(pathname);
        redirect(302, `/${locale}/dashboard/choose-role`);
    }

    return { user, profileVisits: 0 };
};