import { redirect, type Actions } from "@sveltejs/kit";
import { requireAuth } from "$src/lib/utils/auth";
import { UserService } from "$src/features/Users/lib/UserService";
import type { PageServerLoad } from "./$types";

const userService = new UserService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to choose a Role for your account');

    // If user already has a role, redirect to dashboard
    if (user.role) {
        redirect(302, '/dashboard');
    }

    return { user };
};

export const actions: Actions = {
    default: async (event) => {
        const user = requireAuth(event, 'Session Expired. Login again to proceed');

        // Update user role to 'client'
        await userService.updateUser(user.id, {
            role: 'client',
            updatedAt: new Date()
        });

        redirect(302, '/dashboard');
    }
};
