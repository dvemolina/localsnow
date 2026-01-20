import { SchoolClaimRepository, type SchoolClaimWithDetails } from "./schoolClaimRepository";
import type { SchoolClaim } from "$src/lib/server/db/schema";

export class SchoolClaimService {
    private claimRepository: SchoolClaimRepository;

    constructor() {
        this.claimRepository = new SchoolClaimRepository();
    }

    /**
     * Submit a claim request for a school
     */
    async submitClaim(
        schoolId: number,
        claimantUserId: number,
        currentOwnerUserId: number,
        message?: string
    ): Promise<SchoolClaim> {
        try {
            // Check if there's already a pending claim
            const hasPending = await this.claimRepository.hasPendingClaim(schoolId, claimantUserId);
            if (hasPending) {
                throw new Error('You already have a pending claim for this school');
            }

            return await this.claimRepository.createClaim(
                schoolId,
                claimantUserId,
                currentOwnerUserId,
                message
            );
        } catch (error) {
            console.error('Error submitting claim:', error);
            throw error;
        }
    }

    /**
     * Get claim details by ID
     */
    async getClaimById(claimId: number): Promise<SchoolClaimWithDetails | null> {
        try {
            return await this.claimRepository.getClaimById(claimId);
        } catch (error) {
            console.error('Error fetching claim:', error);
            throw new Error('Failed to fetch claim details');
        }
    }

    /**
     * Get pending claims for review (for school owners)
     */
    async getPendingClaimsForOwner(ownerUserId: number): Promise<SchoolClaimWithDetails[]> {
        try {
            return await this.claimRepository.getPendingClaimsForOwner(ownerUserId);
        } catch (error) {
            console.error('Error fetching pending claims:', error);
            throw new Error('Failed to fetch pending claims');
        }
    }

    /**
     * Get claims submitted by a user
     */
    async getClaimsByClaimant(claimantUserId: number): Promise<SchoolClaimWithDetails[]> {
        try {
            return await this.claimRepository.getPendingClaimsByClaimant(claimantUserId);
        } catch (error) {
            console.error('Error fetching claims:', error);
            throw new Error('Failed to fetch claims');
        }
    }

    /**
     * Approve a claim (transfers ownership)
     */
    async approveClaim(
        claimId: number,
        currentOwnerUserId: number,
        responseMessage?: string
    ): Promise<{ claim: SchoolClaim; schoolId: number } | null> {
        try {
            // Verify the current user is the owner
            const claim = await this.claimRepository.getClaimById(claimId);
            if (!claim) {
                throw new Error('Claim not found');
            }

            if (claim.currentOwnerUserId !== currentOwnerUserId) {
                throw new Error('Unauthorized: You are not the owner of this school');
            }

            if (claim.status !== 'pending') {
                throw new Error('This claim has already been reviewed');
            }

            const result = await this.claimRepository.approveClaim(claimId, responseMessage);
            if (!result) return null;

            return {
                claim: result.claim,
                schoolId: result.school.id
            };
        } catch (error) {
            console.error('Error approving claim:', error);
            throw error;
        }
    }

    /**
     * Reject a claim
     */
    async rejectClaim(
        claimId: number,
        currentOwnerUserId: number,
        responseMessage?: string
    ): Promise<SchoolClaim | null> {
        try {
            // Verify the current user is the owner
            const claim = await this.claimRepository.getClaimById(claimId);
            if (!claim) {
                throw new Error('Claim not found');
            }

            if (claim.currentOwnerUserId !== currentOwnerUserId) {
                throw new Error('Unauthorized: You are not the owner of this school');
            }

            if (claim.status !== 'pending') {
                throw new Error('This claim has already been reviewed');
            }

            return await this.claimRepository.rejectClaim(claimId, responseMessage);
        } catch (error) {
            console.error('Error rejecting claim:', error);
            throw error;
        }
    }

    /**
     * Cancel a pending claim (by claimant)
     */
    async cancelClaim(claimId: number, claimantUserId: number): Promise<boolean> {
        try {
            return await this.claimRepository.deleteClaim(claimId, claimantUserId);
        } catch (error) {
            console.error('Error canceling claim:', error);
            throw new Error('Failed to cancel claim');
        }
    }

    /**
     * Get all claims for a school (admin view)
     */
    async getClaimsBySchool(schoolId: number): Promise<SchoolClaimWithDetails[]> {
        try {
            return await this.claimRepository.getClaimsBySchool(schoolId);
        } catch (error) {
            console.error('Error fetching school claims:', error);
            throw new Error('Failed to fetch school claims');
        }
    }
}
