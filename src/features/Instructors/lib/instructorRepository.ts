
import { db } from "$lib/server/db/index";
import { users, instructorSports, instructorResorts } from "$src/lib/server/db/schema";
import type { InsertUser, User } from "$src/lib/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import type { InstructorSignupData } from "./instructorSchemas";

export interface InstructorData {
    userId: number;
    resort: number;
    instructorType: 'instructor-independent' | 'instructor-school';
    profileImageUrl?: string | null;
    qualificationUrl?: string | null;
    countryCode: string;
    phone: string;
    bio: string;
    sports: number[];
    basePrice: number;
    currency: string;
}

export class InstructorRepository {
    async createInstructor(instructorData: InstructorSignupData): Promise<User> {
        return await db.transaction(async (tx) => {
            // Update user with instructor-specific data
            const updatedUser = await tx
                .update(users)
                .set({
                    role: instructorData.instructorType,
                    profileImageUrl: instructorData.profileImageUrl,
                    qualificationUrl: instructorData.qualificationUrl,
                    countryCode: instructorData.countryCode.toString(),
                    phone: instructorData.phone,
                    bio: instructorData.bio,
                    updatedAt: new Date()
                })
                .where(eq(users.id, instructorData.userId))
                .returning();

            if (!updatedUser[0]) {
                throw new Error('Failed to update user as instructor');
            }

            // Insert instructor-resort relationship
            await tx.insert(instructorResorts).values({
                instructorId: instructorData.userId,
                resortId: instructorData.resort
            });

            // Insert instructor-sports relationships
            const sportsRelations = instructorData.sports.map(sportId => ({
                instructorId: instructorData.userId,
                sportId: sportId
            }));

            if (sportsRelations.length > 0) {
                await tx.insert(instructorSports).values(sportsRelations);
            }

            return updatedUser[0];
        });
    }

    async getInstructorById(instructorId: number, role?: InstructorData["instructorType"]): Promise<User | null> {
        const conditions = [eq(users.id, instructorId)];

        if (role !== undefined) {
            conditions.push(eq(users.role, role));
        }

        const result = await db
            .select()
            .from(users)
            .where(and(...conditions));

        return result[0] ?? null;
    }

    async getInstructorSports(instructorId: number): Promise<number[]> {
        const result = await db
            .select({ sportId: instructorSports.sportId })
            .from(instructorSports)
            .where(eq(instructorSports.instructorId, instructorId));
        
        return result.map(r => r.sportId);
    }

    async getInstructorResorts(instructorId: number): Promise<number[]> {
        const result = await db
            .select({ resortId: instructorResorts.resortId })
            .from(instructorResorts)
            .where(eq(instructorResorts.instructorId, instructorId));
        
        return result.map(r => r.resortId);
    }

    async updateInstructor(instructorId: number, updateData: Partial<InstructorData>): Promise<User | null> {
        return await db.transaction(async (tx) => {
            // Update user fields
            const userUpdateFields: Partial<InsertUser> = {};
            
            if (updateData.profileImageUrl !== undefined) userUpdateFields.profileImageUrl = updateData.profileImageUrl;
            if (updateData.qualificationUrl !== undefined) userUpdateFields.qualificationUrl = updateData.qualificationUrl;
            if (updateData.countryCode) userUpdateFields.countryCode = updateData.countryCode;
            if (updateData.phone) userUpdateFields.phone = updateData.phone;
            if (updateData.bio) userUpdateFields.bio = updateData.bio;
            
            userUpdateFields.updatedAt = new Date();

            const updatedUser = await tx
                .update(users)
                .set(userUpdateFields)
                .where(eq(users.id, instructorId))
                .returning();

            // Update resort relationship if provided
            if (updateData.resort) {
                await tx
                    .delete(instructorResorts)
                    .where(eq(instructorResorts.instructorId, instructorId));
                
                await tx.insert(instructorResorts).values({
                    instructorId: instructorId,
                    resortId: updateData.resort
                });
            }

            // Update sports relationships if provided
            if (updateData.sports && updateData.sports.length > 0) {
                await tx
                    .delete(instructorSports)
                    .where(eq(instructorSports.instructorId, instructorId));

                const sportsRelations = updateData.sports.map(sportId => ({
                    instructorId: instructorId,
                    sportId: sportId
                }));

                await tx.insert(instructorSports).values(sportsRelations);
            }

            return updatedUser[0] ?? null;
        });
    }

    async deleteInstructor(instructorId: number): Promise<boolean> {
        return await db.transaction(async (tx) => {
            // Delete relationships first
            await tx
                .delete(instructorSports)
                .where(eq(instructorSports.instructorId, instructorId));

            await tx
                .delete(instructorResorts)
                .where(eq(instructorResorts.instructorId, instructorId));

            // Reset user role and instructor-specific fields
            const result = await tx
                .update(users)
                .set({
                    role: null,
                    profileImageUrl: '/local-snow-head.png',
                    qualificationUrl: null,
                    bio: null,
                    updatedAt: new Date()
                })
                .where(eq(users.id, instructorId))
                .returning();

            return result.length > 0;
        });
    }

    async searchInstructors(filters: {
        resortId?: number;
        sportId?: number;
        searchQuery?: string;
    }) {
        try {
            let query = db
                .select({
                    id: users.id,
                    name: users.name,
                    lastName: users.lastName,
                    email: users.email,
                    profileImageUrl: users.profileImageUrl,
                    bio: users.bio,
                    phone: users.phone,
                    countryCode: users.countryCode,
                    role: users.role,
                    qualificationUrl: users.qualificationUrl,
                    // Join data
                    sports: instructorSports.sportId,
                    resorts: instructorResorts.resortId
                })
                .from(users)
                .leftJoin(instructorSports, eq(users.id, instructorSports.instructorId))
                .leftJoin(instructorResorts, eq(users.id, instructorResorts.instructorId))
                .$dynamic();

            // Build WHERE conditions
            const conditions = [
                or(
                    eq(users.role, 'instructor-independent'),
                    eq(users.role, 'instructor-school')
                )
            ];

            // Filter by resort
            if (filters.resortId) {
                query = query.where(
                    and(
                        ...conditions,
                        eq(instructorResorts.resortId, filters.resortId)
                    )
                );
            } else {
                query = query.where(and(...conditions));
            }

            // Execute query
            const results = await query;

            // Group by instructor ID to handle multiple sports/resorts
            const instructorsMap = new Map();

            for (const row of results) {
                if (!instructorsMap.has(row.id)) {
                    instructorsMap.set(row.id, {
                        id: row.id,
                        name: row.name,
                        lastName: row.lastName,
                        email: row.email,
                        profileImageUrl: row.profileImageUrl,
                        bio: row.bio,
                        phone: row.phone,
                        countryCode: row.countryCode,
                        role: row.role,
                        qualificationUrl: row.qualificationUrl,
                        sports: [],
                        resorts: []
                    });
                }

                const instructor = instructorsMap.get(row.id);
                
                // Add sport if exists and not already added
                if (row.sports && !instructor.sports.includes(row.sports)) {
                    instructor.sports.push(row.sports);
                }
                
                // Add resort if exists and not already added
                if (row.resorts && !instructor.resorts.includes(row.resorts)) {
                    instructor.resorts.push(row.resorts);
                }
            }

            let instructorsList = Array.from(instructorsMap.values());

            // Filter by sport if specified
            if (filters.sportId) {
                instructorsList = instructorsList.filter(instructor =>
                    instructor.sports.includes(filters.sportId)
                );
            }

            // Filter by search query (name)
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                instructorsList = instructorsList.filter(instructor =>
                    instructor.name.toLowerCase().includes(query) ||
                    instructor.lastName.toLowerCase().includes(query)
                );
            }

            return instructorsList;
        } catch (error) {
            console.error('Error in searchInstructors:', error);
            throw error;
        }
    }
}