// src/routes/dashboard/+layout.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { getRoles, hasAnyRole, type UserRole } from "$src/lib/utils/roles";
import { isRoute, route } from "$src/lib/i18n/routeHelpers";
import type { Locale } from "$src/lib/i18n/routes";

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

    if (getRoles(user).length === 0 && !isChooseRolePath) {
        const locale = getLocaleFromPath(pathname);
        redirect(302, route('/dashboard/choose-role', locale as Locale));
    }

    const accessRules: Array<{ path: string; roles: UserRole[] }> = [
        { path: '/dashboard/lessons', roles: ['instructor-independent'] },
        { path: '/dashboard/availability', roles: ['instructor-independent'] },
        { path: '/dashboard/leads', roles: ['instructor-independent', 'instructor-school'] },
        { path: '/dashboard/bookings', roles: ['instructor-independent', 'instructor-school'] },
        { path: '/dashboard/schools', roles: ['instructor-school'] },
        { path: '/dashboard/invitations', roles: ['instructor-school'] },
        { path: '/dashboard/my-bookings', roles: ['client'] },
        { path: '/dashboard/profile', roles: ['client', 'instructor-independent', 'instructor-school'] },
        { path: '/dashboard/school', roles: ['school-admin'] }
    ];

    for (const rule of accessRules) {
        if (isRoute(pathname, rule.path) && !hasAnyRole(user, rule.roles)) {
            const locale = getLocaleFromPath(pathname);
            redirect(302, route('/dashboard', locale as Locale));
        }
    }

    return { user, profileVisits: 0 };
};
