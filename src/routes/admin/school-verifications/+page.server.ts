import { requireAuth } from "$src/lib/utils/auth.js";
import type { PageServerLoad } from "./$types.js";
import { redirect } from "@sveltejs/kit";
import { SchoolVerificationService } from "$src/features/Schools/lib/schoolVerificationService";

const verificationService = new SchoolVerificationService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access admin');

    if (user.role !== 'admin') {
        redirect(302, '/dashboard');
    }

    // Get all pending verification requests
    const pendingRequests = await verificationService.getPendingRequests();

    return {
        pendingRequests: pendingRequests.map(req => ({
            id: req.id,
            schoolName: req.schoolName,
            schoolId: req.schoolId,
            existingSchool: req.school ? {
                id: req.school.id,
                name: req.school.name,
                isVerified: req.school.isVerified
            } : null,
            requester: req.requester ? {
                id: req.requester.id,
                name: `${req.requester.name} ${req.requester.lastName}`,
                email: req.requester.email,
                role: req.requester.role
            } : null,
            resort: req.resort,
            message: req.message,
            proofDocument: req.proofDocument,
            createdAt: req.createdAt?.toISOString()
        }))
    };
};
