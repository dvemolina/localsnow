import { requireAuth } from "$src/lib/utils/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { WorkingHoursService } from "$src/features/Availability/lib/workingHoursService";

const workingHoursService = new WorkingHoursService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access working hours');
    
    // Only instructors can access
    if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
        redirect(302, '/dashboard');
    }
    
    // Load existing working hours
    const workingHours = await workingHoursService.getInstructorWorkingHours(user.id);
    
    return {
        workingHours
    };
};