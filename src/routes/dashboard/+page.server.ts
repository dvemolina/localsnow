// src/routes/dashboard/+page.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import type { PageServerLoad } from "./$types";
import { getMonthlyVisits } from "$src/features/Dashboard/lib/utils";
import { LeadService } from "$src/features/Leads/lib/leadService";

const leadService = new LeadService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access the Dashboard');

    let profileVisits = 0;
    let leadStats = null;
    let recentLeads = null;

    // Get profile visits and lead data for instructors
    if (user.role === 'instructor-independent' || user.role === 'instructor-school') {
        try {
            profileVisits = await getMonthlyVisits(user.id);
        } catch (error) {
            console.error('Failed to get profile visits:', error);
            // Continue with profileVisits = 0
        }

        // Get lead statistics and recent leads
        try {
            leadStats = await leadService.getInstructorLeadStats(user.id);
            recentLeads = await leadService.getInstructorLeads(user.id, 10, 0); // Get 10 most recent leads
        } catch (error) {
            console.error('Failed to get lead data:', error);
            // Continue with null values
        }
    }

    return {
        user,
        profileVisits,
        leadStats,
        recentLeads
    };
};