// src/routes/admin/+layout.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import { hasAdminAccess } from "$src/lib/utils/roles";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    const user = requireAuth(event, 'Login required to access admin dashboard');

    // Allow full internal management access for admins and operators.
    if (!hasAdminAccess(user)) {
        error(403, 'Access denied. Admin/operator privileges required.');
    }

    return { user };
};
