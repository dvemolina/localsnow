import { requireAuth } from "$src/lib/utils/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access School Lessons');

    // Only school admins can access
    if (user.role !== 'school-admin') {
        redirect(302, '/dashboard');
    }

    return { user };
};
