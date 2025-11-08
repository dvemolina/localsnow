// src/routes/admin/+layout.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    const user = requireAuth(event, 'Login required to access admin dashboard');

    // Only allow admin role
    if (user.role !== 'admin') {
        error(403, 'Access denied. Admin privileges required.');
    }

    return { user };
};
