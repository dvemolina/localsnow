import { requireAuth } from "$src/lib/utils/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { isCalendarConnected } from "$lib/server/google/oauth";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { instructorGoogleTokens } from "$src/lib/server/db/schema";
import { WorkingHoursService } from "$src/features/Availability/lib/workingHoursService";

const workingHoursService = new WorkingHoursService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access availability settings');
    
    // Only instructors can access
    if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
        redirect(302, '/dashboard');
    }
    
    // Check connection status
    const connected = await isCalendarConnected(user.id);
    
    // Check if working hours are configured
    const workingHoursConfigured = await workingHoursService.hasWorkingHours(user.id);
    
    // Get sync details if connected
    let syncDetails = null;
    if (connected) {
        const result = await db
            .select({
                lastSyncAt: instructorGoogleTokens.lastSyncAt,
                syncEnabled: instructorGoogleTokens.syncEnabled,
                calendarId: instructorGoogleTokens.calendarId
            })
            .from(instructorGoogleTokens)
            .where(eq(instructorGoogleTokens.instructorId, user.id))
            .limit(1);
        
        syncDetails = result[0] || null;
    }
    
    // Check for success/error messages from OAuth callback
    const success = event.url.searchParams.get('success');
    const error = event.url.searchParams.get('error');
    
    return {
        connected,
        syncDetails,
        workingHoursConfigured,
        successMessage: success === 'connected' ? 'Calendar connected successfully!' : null,
        errorMessage: error ? getErrorMessage(error) : null
    };
};

function getErrorMessage(errorCode: string): string {
    const messages: Record<string, string> = {
        'access_denied': 'You denied access to your Google Calendar.',
        'invalid_request': 'Invalid request. Please try again.',
        'connection_failed': 'Failed to connect to Google Calendar. Please try again.'
    };
    return messages[errorCode] || 'An unknown error occurred.';
}