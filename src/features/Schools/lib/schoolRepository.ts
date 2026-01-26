import { db } from "$lib/server/db/index";
import { schools, schoolResorts, schoolAdmins, users, userRoles, type InsertSchool, type School } from "$src/lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { SchoolSignupData } from "./validations/schoolSchemas";


export class SchoolRepository {
    async createSchool(schoolData: SchoolSignupData): Promise<School> {
        return await db.transaction(async (tx) => {
            // Create school record
            const newSchool = await tx
                .insert(schools)
                .values({
                    ownerUserId: schoolData.ownerUserId,
                    name: schoolData.name,
                    slug: schoolData.slug,
                    bio: schoolData.bio,
                    schoolEmail: schoolData.schoolEmail,
                    countryCode: schoolData.countryCode.toString(),
                    schoolPhone: schoolData.schoolPhone,
                    logo: schoolData.logoUrl
                })
                .returning();

            if (!newSchool[0]) {
                throw new Error('Failed to create school');
            }

            // Update user role to school-admin
            await tx
                .update(users)
                .set({
                    role: 'school-admin',
                    updatedAt: new Date()
                })
                .where(eq(users.id, schoolData.ownerUserId));

            await tx
                .insert(userRoles)
                .values({
                    userId: schoolData.ownerUserId,
                    role: 'school-admin'
                })
                .onConflictDoNothing();

            // Add owner as school admin with isOwner flag
            await tx.insert(schoolAdmins).values({
                schoolId: newSchool[0].id,
                userId: schoolData.ownerUserId,
                isAccepted: true,
                isOwner: true
            });

            // Insert school-resort relationship
            await tx.insert(schoolResorts).values({
                schoolId: newSchool[0].id,
                resortId: schoolData.resort
            });

            return newSchool[0];
        });
    }

    async getSchoolById(schoolId: number): Promise<School | null> {
        const result = await db
            .select()
            .from(schools)
            .where(eq(schools.id, schoolId));
        return result[0] ?? null;
    }

    async getSchoolBySlug(slug: string): Promise<School | null> {
        const result = await db
            .select()
            .from(schools)
            .where(eq(schools.slug, slug));
        return result[0] ?? null;
    }

    async getSchoolByOwner(ownerUserId: number): Promise<School | null> {
        const result = await db
            .select()
            .from(schools)
            .where(eq(schools.ownerUserId, ownerUserId));
        return result[0] ?? null;
    }

    async getSchoolResorts(schoolId: number): Promise<number[]> {
        const result = await db
            .select({ resortId: schoolResorts.resortId })
            .from(schoolResorts)
            .where(eq(schoolResorts.schoolId, schoolId));
        
        return result.map(r => r.resortId);
    }

    async updateSchool(schoolId: number, updateData: Partial<InsertSchool>): Promise<School | null> {
        return await db.transaction(async (tx) => {
            // Prepare update object
            const schoolUpdateFields: Partial<typeof schools.$inferInsert> = {};
            
            if (updateData.name) schoolUpdateFields.name = updateData.name;
            if (updateData.slug) schoolUpdateFields.slug = updateData.slug;
            if (updateData.bio) schoolUpdateFields.bio = updateData.bio;
            if (updateData.schoolEmail) schoolUpdateFields.schoolEmail = updateData.schoolEmail;
            if (updateData.countryCode) schoolUpdateFields.countryCode = updateData.countryCode;
            if (updateData.schoolPhone) schoolUpdateFields.schoolPhone = updateData.schoolPhone;
            if (updateData.logo !== undefined) schoolUpdateFields.logo = updateData.logo;

            const updatedSchool = await tx
                .update(schools)
                .set(schoolUpdateFields)
                .where(eq(schools.id, schoolId))
                .returning();

            // Update resort relationship if provided
            if (updateData.resort) {
                await tx
                    .delete(schoolResorts)
                    .where(eq(schoolResorts.schoolId, schoolId));
                
                await tx.insert(schoolResorts).values({
                    schoolId: schoolId,
                    resortId: updateData.resort
                });
            }

            return updatedSchool[0] ?? null;
        });
    }

    async updateSchoolVerificationStatus(schoolId: number, isVerified: boolean): Promise<School | null> {
        const result = await db
            .update(schools)
            .set({ isVerified })
            .where(eq(schools.id, schoolId))
            .returning();
        
        return result[0] ?? null;
    }

    async updateSchoolPublishedStatus(schoolId: number, isPublished: boolean): Promise<School | null> {
        const result = await db
            .update(schools)
            .set({ isPublished })
            .where(eq(schools.id, schoolId))
            .returning();
        
        return result[0] ?? null;
    }

    async deleteSchool(schoolId: number): Promise<boolean> {
        return await db.transaction(async (tx) => {
            // Get school to find owner
            const school = await tx
                .select({ ownerUserId: schools.ownerUserId })
                .from(schools)
                .where(eq(schools.id, schoolId));

            if (!school[0]) {
                return false;
            }

            // Delete school-resort relationships
            await tx
                .delete(schoolResorts)
                .where(eq(schoolResorts.schoolId, schoolId));

            // Delete school
            const result = await tx
                .delete(schools)
                .where(eq(schools.id, schoolId))
                .returning();

            // Reset owner's role
            if (result.length > 0) {
                await tx
                    .delete(userRoles)
                    .where(and(
                        eq(userRoles.userId, school[0].ownerUserId),
                        eq(userRoles.role, 'school-admin')
                    ));

                const remainingRoles = await tx
                    .select({ role: userRoles.role })
                    .from(userRoles)
                    .where(eq(userRoles.userId, school[0].ownerUserId));

                const nextPrimaryRole = remainingRoles[0]?.role ?? null;

                await tx
                    .update(users)
                    .set({
                        role: nextPrimaryRole,
                        updatedAt: new Date()
                    })
                    .where(eq(users.id, school[0].ownerUserId));
            }

            return result.length > 0;
        });
    }

    async checkSlugAvailability(slug: string, excludeId?: number): Promise<boolean> {
        const query = db
            .select({ id: schools.id })
            .from(schools)
            .where(eq(schools.slug, slug));

        if (excludeId) {
            query.where(and(eq(schools.slug, slug), eq(schools.id, excludeId)));
        }

        const result = await query;
        return result.length === 0;
    }

    async getAllSchools(limit?: number, offset?: number): Promise<School[]> {
        let query = db
            .select()
            .from(schools)
            .where(eq(schools.isPublished, true));

        if (limit) {
            query = query.limit(limit);
        }

        if (offset) {
            query = query.offset(offset);
        }

        return await query;
    }

    async getSchoolsByResort(resortId: number): Promise<School[]> {
        const result = await db
            .select({
                uuid: schools.uuid,
                id: schools.id,
                ownerUserId: schools.ownerUserId,
                name: schools.name,
                slug: schools.slug,
                bio: schools.bio,
                schoolEmail: schools.schoolEmail,
                countryCode: schools.countryCode,
                schoolPhone: schools.schoolPhone,
                logo: schools.logo,
                isPublished: schools.isPublished,
                isVerified: schools.isVerified
            })
            .from(schools)
            .innerJoin(schoolResorts, eq(schools.id, schoolResorts.schoolId))
            .where(
                and(
                    eq(schoolResorts.resortId, resortId),
                    eq(schools.isPublished, true)
                )
            );

        return result;
    }
}
