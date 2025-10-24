// src/routes/dashboard/choose-role/+layout.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to choose a Role for your account');
    
    return { user };
};