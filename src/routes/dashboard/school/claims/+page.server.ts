import { requireAuth } from "$src/lib/utils/auth.js";
import type { PageServerLoad } from "./$types.js";
import { redirect } from "@sveltejs/kit";
import { SchoolClaimService } from "$src/features/Schools/lib/schoolClaimService";

const claimService = new SchoolClaimService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access dashboard');

    if (user.role !== 'school-admin') {
        redirect(302, '/dashboard');
    }

    // Get pending claims for this school owner
    const pendingClaims = await claimService.getPendingClaimsForOwner(user.id);

    return {
        pendingClaims: pendingClaims.map(claim => ({
            id: claim.id,
            schoolId: claim.schoolId,
            schoolName: claim.school?.name || 'Unknown School',
            claimantName: claim.claimant ? `${claim.claimant.name} ${claim.claimant.lastName}` : 'Unknown',
            claimantEmail: claim.claimant?.email || '',
            message: claim.message,
            createdAt: claim.createdAt?.toISOString()
        }))
    };
};
