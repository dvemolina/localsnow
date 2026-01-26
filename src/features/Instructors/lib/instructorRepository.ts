import { db } from "$lib/server/db/index";
import { users, instructorSports, instructorResorts, lessons, lessonSports as lessonSportsTable, resorts, schoolInstructors, schools, userRoles } from "$src/lib/server/db/schema";
import type { InsertUser, User } from "$src/lib/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import type { InstructorSignupData } from "./instructorSchemas";
import { getSportIdBySlug } from "$src/features/Sports/lib/sportsConstants";



export interface InstructorData {
    userId: number;
    resort?: number;
    instructorType?: 'instructor-independent' | 'instructor-school';
    profileImageUrl?: string | null;
    qualificationUrl?: string | null;
    professionalCountryCode?: string;
    professionalPhone?: string;
    bio?: string;
    sports?: number[];
    spokenLanguages?: string[];
    basePrice?: number;
    currency?: string;
    isPublished?: boolean;
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
                    professionalCountryCode: instructorData.professionalCountryCode.toString(),
                    professionalPhone: instructorData.professionalPhone,
                    bio: instructorData.bio,
                    spokenLanguages: instructorData.spokenLanguages,
                    updatedAt: new Date()
                })
                .where(eq(users.id, instructorData.userId))
                .returning();

            await tx
                .insert(userRoles)
                .values({
                    userId: instructorData.userId,
                    role: instructorData.instructorType
                })
                .onConflictDoNothing();

            if (!updatedUser[0]) {
                throw new Error('Failed to update user as instructor');
            }

            // Insert instructor-resort relationship (only if resort is provided)
            if (instructorData.resort && instructorData.resort > 0) {
                await tx.insert(instructorResorts).values({
                    instructorId: instructorData.userId,
                    resortId: instructorData.resort
                });
            }

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

        let instructorRole: InstructorData["instructorType"] | null = null;

        if (role !== undefined) {
            const matchingRoles = await db
                .select({ role: userRoles.role })
                .from(userRoles)
                .where(and(eq(userRoles.userId, instructorId), eq(userRoles.role, role)));

            if (matchingRoles.length === 0) {
                return null;
            }
            instructorRole = matchingRoles[0].role as InstructorData["instructorType"];
        } else {
            const instructorRoles = await db
                .select({ role: userRoles.role })
                .from(userRoles)
                .where(and(
                    eq(userRoles.userId, instructorId),
                    or(
                        eq(userRoles.role, 'instructor-independent'),
                        eq(userRoles.role, 'instructor-school')
                    )
                ));

            if (instructorRoles.length === 0) {
                return null;
            }
            instructorRole = instructorRoles[0].role as InstructorData["instructorType"];
        }

        const result = await db
            .select()
            .from(users)
            .where(and(...conditions));

        const user = result[0] ?? null;
        if (!user) return null;
        return { ...user, role: instructorRole ?? user.role };
    }

    async getInstructorSports(instructorId: number): Promise<number[]> {
        const result = await db
            .select({ sportId: instructorSports.sportId })
            .from(instructorSports)
            .where(eq(instructorSports.instructorId, instructorId));
        
        return result.map(r => r.sportId);
    }

    async getInstructorResorts(instructorId: number): Promise<Array<{ id: number; name: string; slug: string }>> {
        const result = await db
            .select({
                id: resorts.id,
                name: resorts.name,
                slug: resorts.slug
            })
            .from(instructorResorts)
            .innerJoin(resorts, eq(instructorResorts.resortId, resorts.id))
            .where(eq(instructorResorts.instructorId, instructorId));

        return result;
    }

    async updateInstructor(instructorId: number, updateData: Partial<InstructorData>): Promise<User | null> {
        return await db.transaction(async (tx) => {
            // Update user fields
            const userUpdateFields: Partial<InsertUser> = {};

            if (updateData.profileImageUrl !== undefined) userUpdateFields.profileImageUrl = updateData.profileImageUrl;
            if (updateData.qualificationUrl !== undefined) userUpdateFields.qualificationUrl = updateData.qualificationUrl;
            if (updateData.professionalCountryCode) userUpdateFields.professionalCountryCode = updateData.professionalCountryCode;
            if (updateData.professionalPhone) userUpdateFields.professionalPhone = updateData.professionalPhone;
            if (updateData.bio !== undefined) userUpdateFields.bio = updateData.bio;
            if (updateData.spokenLanguages !== undefined) userUpdateFields.spokenLanguages = updateData.spokenLanguages;
            if (updateData.isPublished !== undefined) userUpdateFields.isPublished = updateData.isPublished;

            userUpdateFields.updatedAt = new Date();

            const updatedUser = await tx
                .update(users)
                .set(userUpdateFields)
                .where(eq(users.id, instructorId))
                .returning();

            // Update resort relationship if provided (only if resort > 0)
            if (updateData.resort && updateData.resort > 0) {
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
            await tx
                .delete(userRoles)
                .where(and(
                    eq(userRoles.userId, instructorId),
                    or(
                        eq(userRoles.role, 'instructor-independent'),
                        eq(userRoles.role, 'instructor-school')
                    )
                ));

            const remainingRoles = await tx
                .select({ role: userRoles.role })
                .from(userRoles)
                .where(eq(userRoles.userId, instructorId));

            const nextPrimaryRole = remainingRoles[0]?.role ?? null;

            const result = await tx
                .update(users)
                .set({
                    role: nextPrimaryRole,
                    profileImageUrl: '/local-snow-head.png',
                    qualificationUrl: null,
                    bio: null,
                    spokenLanguages: null,
                    updatedAt: new Date()
                })
                .where(eq(users.id, instructorId))
                .returning();

            return result.length > 0;
        });
    }

    async searchInstructors(filters: {
        resortId?: number;
        sportId?: number | string; // Can be numeric ID or slug string
        searchQuery?: string;
        language?: string;
        priceMin?: number;
        priceMax?: number;
        instructorType?: 'instructor-independent' | 'instructor-school';
        verifiedOnly?: boolean;
        schoolId?: number;
        sortBy?: string;
    }) {
        // Convert sport slug to ID if it's a string
        let sportIdNumeric: number | undefined;
        if (filters.sportId) {
            if (typeof filters.sportId === 'string') {
                sportIdNumeric = getSportIdBySlug(filters.sportId);
            } else {
                sportIdNumeric = filters.sportId;
            }
        }

        try {
            // CRITICAL FIX: Use INNER JOIN when filtering by resort/sport/school
            // This ensures only instructors with matching associations are returned
            // LEFT JOIN would return ALL instructors, even those without the filtered resort/sport

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
                    role: userRoles.role,
                    qualificationUrl: users.qualificationUrl,
                    spokenLanguages: users.spokenLanguages,
                    isVerified: users.isVerified,
                    // Join data
                    sports: instructorSports.sportId,
                    resorts: instructorResorts.resortId,
                    // School data
                    schoolId: schools.id,
                    schoolName: schools.name,
                    schoolSlug: schools.slug
                })
                .from(users)
                .innerJoin(userRoles, eq(users.id, userRoles.userId));

            // Use INNER JOIN for sports if filtering by sport, otherwise LEFT JOIN
            if (sportIdNumeric) {
                query = query.innerJoin(instructorSports, eq(users.id, instructorSports.instructorId));
            } else {
                query = query.leftJoin(instructorSports, eq(users.id, instructorSports.instructorId));
            }

            // Use INNER JOIN for resorts if filtering by resort, otherwise LEFT JOIN
            if (filters.resortId) {
                query = query.innerJoin(instructorResorts, eq(users.id, instructorResorts.instructorId));
            } else {
                query = query.leftJoin(instructorResorts, eq(users.id, instructorResorts.instructorId));
            }

            // Use INNER JOIN for schools if filtering by school, otherwise LEFT JOIN
            if (filters.schoolId) {
                query = query
                    .innerJoin(schoolInstructors, and(
                        eq(users.id, schoolInstructors.instructorId),
                        eq(schoolInstructors.isAcceptedBySchool, true),
                        eq(schoolInstructors.isActive, true)
                    ))
                    .innerJoin(schools, eq(schoolInstructors.schoolId, schools.id));
            } else {
                query = query
                    .leftJoin(schoolInstructors, and(
                        eq(users.id, schoolInstructors.instructorId),
                        eq(schoolInstructors.isAcceptedBySchool, true),
                        eq(schoolInstructors.isActive, true)
                    ))
                    .leftJoin(schools, eq(schoolInstructors.schoolId, schools.id));
            }

            query = query.$dynamic();

            // Build WHERE conditions
            const conditions: any[] = [];

            // Filter by instructor type if specified, otherwise get both types
            if (filters.instructorType) {
                conditions.push(eq(userRoles.role, filters.instructorType));
            } else {
                conditions.push(
                    or(
                        eq(userRoles.role, 'instructor-independent'),
                        eq(userRoles.role, 'instructor-school')
                    )
                );
            }

            // CRITICAL: Only show published profiles in public directory
            conditions.push(eq(users.isPublished, true));

            // Filter by verified status if specified
            if (filters.verifiedOnly) {
                conditions.push(eq(users.isVerified, true));
            }

            // Filter by resort
            if (filters.resortId) {
                conditions.push(eq(instructorResorts.resortId, filters.resortId));
            }

            // Filter by school
            if (filters.schoolId) {
                conditions.push(eq(schoolInstructors.schoolId, filters.schoolId));
                conditions.push(eq(schoolInstructors.isAcceptedBySchool, true)); // Only show accepted instructors
            }

            query = query.where(and(...conditions));

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
                        spokenLanguages: row.spokenLanguages,
                        isVerified: row.isVerified,
                        sports: [],
                        resorts: [],
                        school: row.schoolId ? {
                            id: row.schoolId,
                            name: row.schoolName,
                            slug: row.schoolSlug
                        } : null
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
            if (sportIdNumeric) {
                instructorsList = instructorsList.filter(instructor =>
                    instructor.sports.includes(sportIdNumeric)
                );
            }

            // Filter by language if specified
            if (filters.language) {
                instructorsList = instructorsList.filter(instructor =>
                    instructor.spokenLanguages &&
                    instructor.spokenLanguages.includes(filters.language)
                );
            }

            // Basic sorting (name-based only, price and rating sorting happens in page.server after fetching lessons)
            if (filters.sortBy === 'name_asc') {
                instructorsList.sort((a, b) => a.name.localeCompare(b.name));
            } else if (filters.sortBy === 'name_desc') {
                instructorsList.sort((a, b) => b.name.localeCompare(a.name));
            }

            return instructorsList;
        } catch (error) {
            console.error('Error in searchInstructors:', error);
            throw error;
        }
    }

    async getInstructorWithLessons(instructorId: number) {
        try {
            // Get instructor basic info
            const instructor = await this.getInstructorById(instructorId);
            if (!instructor) return null;

            // Get instructor's base lesson
            const instructorLessons = await db
                .select()
                .from(lessons)
                .where(
                    and(
                        eq(lessons.instructorId, instructorId),
                        eq(lessons.isBaseLesson, true)
                    )
                );

            const baseLesson = instructorLessons[0] || null;

            // If there's a base lesson, get its sports
            let baseLessonSports: number[] = [];
            if (baseLesson) {
                const sports = await db
                    .select({ sportId: lessonSportsTable.sportId })
                    .from(lessonSportsTable)
                    .where(eq(lessonSportsTable.lessonId, baseLesson.id));
                
                baseLessonSports = sports.map(s => s.sportId);
            }

            return {
                instructor,
                baseLesson: baseLesson ? {
                    ...baseLesson,
                    sports: baseLessonSports
                } : null
            };
        } catch (error) {
            console.error('Error fetching instructor with lessons:', error);
            throw error;
        }
    }
}
