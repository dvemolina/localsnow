import { requireAuth } from "$src/lib/utils/auth.js";
import type { PageServerLoad, Actions } from "./$types.js";
import { fail } from "@sveltejs/kit";
import { db } from "$src/lib/server/db/index.js";
import { resorts } from "$src/lib/server/db/schema.js";

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access dashboard');

    // Get all resorts for the dropdown
    const allResorts = await db.select().from(resorts);

    return {
        resorts: allResorts,
        user
    };
};

export const actions: Actions = {
    search: async ({ request }) => {
        const formData = await request.formData();
        const searchTerm = formData.get('searchTerm') as string;
        const resortId = formData.get('resortId') as string;

        if (!searchTerm || searchTerm.trim().length < 2) {
            return fail(400, { message: 'Search term must be at least 2 characters' });
        }

        return { searchTerm, resortId };
    }
};
