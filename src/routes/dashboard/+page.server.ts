// src/routes/dashboard/+page.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import type { PageServerLoad } from "./$types";
import { getMonthlyVisits } from "$src/features/Dashboard/lib/utils";

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access the Dashboard');
    
    let profileVisits = 0;
    
    // Get profile visits for instructors
    if (user.role === 'instructor-independent' || user.role === 'instructor-school') {
        try {
            profileVisits = await getMonthlyVisits(user.id);
        } catch (error) {
            console.error('Failed to get profile visits:', error);
            // Continue with profileVisits = 0
        }
    }
    
    return { 
        user,
        profileVisits
    };
};