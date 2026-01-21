import { SchoolVerificationRepository, type SchoolVerificationRequestWithDetails } from "./schoolVerificationRepository";
import { SchoolRepository } from "./schoolRepository";
import { SchoolInstructorRepository } from "./schoolInstructorRepository";
import type { SchoolVerificationRequest } from "$src/lib/server/db/schema";
import { db } from "$lib/server/db";
import { users, schoolAdmins, schools } from "$src/lib/server/db/schema";
import { eq } from "drizzle-orm";

export class SchoolVerificationService {
    private verificationRepo: SchoolVerificationRepository;
    private schoolRepo: SchoolRepository;
    private instructorRepo: SchoolInstructorRepository;

    constructor() {
        this.verificationRepo = new SchoolVerificationRepository();
        this.schoolRepo = new SchoolRepository();
        this.instructorRepo = new SchoolInstructorRepository();
    }

    /**
     * Submit a verification request to admin
     */
    async submitRequest(data: {
        requesterId: number;
        schoolId?: number;
        schoolName: string;
        schoolEmail?: string;
        schoolPhone?: string;
        resortId?: number;
        countryCode?: string;
        message?: string;
        proofDocument?: string;
    }): Promise<SchoolVerificationRequest> {
        try {
            // Check if user already has a pending request
            const hasPending = await this.verificationRepo.hasPendingRequest(
                data.requesterId,
                data.schoolId
            );

            if (hasPending) {
                throw new Error('You already have a pending verification request');
            }

            return await this.verificationRepo.createRequest(data);
        } catch (error) {
            console.error('Error submitting verification request:', error);
            throw error;
        }
    }

    /**
     * Get all pending requests (admin only)
     */
    async getPendingRequests(): Promise<SchoolVerificationRequestWithDetails[]> {
        try {
            return await this.verificationRepo.getPendingRequests();
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            throw new Error('Failed to fetch pending requests');
        }
    }

    /**
     * Get request details
     */
    async getRequestById(requestId: number): Promise<SchoolVerificationRequestWithDetails | null> {
        try {
            return await this.verificationRepo.getRequestById(requestId);
        } catch (error) {
            console.error('Error fetching request:', error);
            throw new Error('Failed to fetch request details');
        }
    }

    /**
     * Get requests by user
     */
    async getRequestsByUser(userId: number): Promise<SchoolVerificationRequestWithDetails[]> {
        try {
            return await this.verificationRepo.getRequestsByUser(userId);
        } catch (error) {
            console.error('Error fetching user requests:', error);
            throw new Error('Failed to fetch your requests');
        }
    }

    /**
     * Approve request and grant user access to school (admin only)
     */
    async approveRequest(
        requestId: number,
        adminId: number,
        adminNotes?: string
    ): Promise<{ success: boolean; schoolId?: number }> {
        try {
            // Get request details
            const request = await this.verificationRepo.getRequestById(requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            if (request.status !== 'pending') {
                throw new Error('Request has already been reviewed');
            }

            return await db.transaction(async (tx) => {
                // Approve the request
                await this.verificationRepo.approveRequest(requestId, adminId, adminNotes);

                let schoolId = request.schoolId;

                // If no school exists, create it
                if (!schoolId && request.resortId && request.countryCode) {
                    const school = await this.schoolRepo.createInstructorListedSchool(
                        request.requesterId,
                        request.schoolName,
                        request.resortId,
                        request.countryCode,
                        undefined,
                        request.schoolEmail || undefined,
                        request.schoolPhone || undefined
                    );
                    schoolId = school.id;
                }

                if (schoolId) {
                    // Update user role to school-admin
                    await tx
                        .update(users)
                        .set({
                            role: 'school-admin',
                            updatedAt: new Date()
                        })
                        .where(eq(users.id, request.requesterId));

                    // Update school ownership
                    await tx
                        .update(schools)
                        .set({
                            ownerUserId: request.requesterId,
                            updatedAt: new Date()
                        })
                        .where(eq(schools.id, schoolId));

                    // Add as school admin
                    await tx.insert(schoolAdmins).values({
                        schoolId,
                        userId: request.requesterId,
                        isAccepted: true,
                        isOwner: true
                    });
                }

                return { success: true, schoolId: schoolId || undefined };
            });
        } catch (error) {
            console.error('Error approving request:', error);
            throw error;
        }
    }

    /**
     * Reject request (admin only)
     */
    async rejectRequest(
        requestId: number,
        adminId: number,
        adminNotes?: string
    ): Promise<SchoolVerificationRequest | null> {
        try {
            const request = await this.verificationRepo.getRequestById(requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            if (request.status !== 'pending') {
                throw new Error('Request has already been reviewed');
            }

            return await this.verificationRepo.rejectRequest(requestId, adminId, adminNotes);
        } catch (error) {
            console.error('Error rejecting request:', error);
            throw error;
        }
    }

    /**
     * Cancel request (user can cancel their own)
     */
    async cancelRequest(requestId: number, userId: number): Promise<boolean> {
        try {
            return await this.verificationRepo.deleteRequest(requestId, userId);
        } catch (error) {
            console.error('Error canceling request:', error);
            throw new Error('Failed to cancel request');
        }
    }
}
