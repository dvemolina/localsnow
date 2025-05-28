import { SchoolRepository } from "./schoolRepository";
import type { SchoolSignupData, SchoolSignupSchema } from "../lib/validations/schoolSchemas";
import { slugifyString } from "$src/lib/utils/generics";
import type { InsertSchool, School } from "$src/lib/server/db/schema";

export class SchoolService {
    private schoolRepository: SchoolRepository;

    constructor() {
        this.schoolRepository = new SchoolRepository();
    }


    async createSchool(schoolData: SchoolSignupData): Promise<School> {
        try {
            return await this.schoolRepository.createSchool(schoolData);
        } catch (error) {
            console.error('Error creating school:', error);
            throw new Error('Failed to create school profile');
        }
    }

    async getSchoolById(schoolId: number): Promise<School | null> {
        try {
            return await this.schoolRepository.getSchoolById(schoolId);
        } catch (error) {
            console.error('Error fetching school:', error);
            throw new Error('Failed to fetch school profile');
        }
    }

    async getSchoolBySlug(slug: string): Promise<School | null> {
        try {
            return await this.schoolRepository.getSchoolBySlug(slug);
        } catch (error) {
            console.error('Error fetching school by slug:', error);
            throw new Error('Failed to fetch school profile');
        }
    }

    async getSchoolByOwner(ownerUserId: number): Promise<School | null> {
        try {
            return await this.schoolRepository.getSchoolByOwner(ownerUserId);
        } catch (error) {
            console.error('Error fetching school by owner:', error);
            throw new Error('Failed to fetch school profile');
        }
    }

    async getSchoolWithRelations(schoolId: number): Promise<{
        school: School | null;
        resorts: number[];
    }> {
        try {
            const [school, resorts] = await Promise.all([
                this.schoolRepository.getSchoolById(schoolId),
                this.schoolRepository.getSchoolResorts(schoolId)
            ]);

            return {
                school,
                resorts
            };
        } catch (error) {
            console.error('Error fetching school with relations:', error);
            throw new Error('Failed to fetch school details');
        }
    }

    async updateSchool(
        schoolId: number,
        formData: Partial<SchoolSignupSchema>,
        logoUrl?: string | null
    ): Promise<School | null> {
        try {
            const updateData: Partial<InsertSchool> = {
                ...formData,
                logo: logoUrl
            };

            // If name is being updated, regenerate slug
            if (formData.name) {
                let slug = slugifyString(formData.name);
                let slugSuffix = 1;

                // Ensure slug uniqueness (excluding current school)
                while (!(await this.schoolRepository.checkSlugAvailability(slug, schoolId))) {
                    slug = `${slugifyString(formData.name)}-${slugSuffix}`;
                    slugSuffix++;
                }

                updateData.slug = slug;
            }

            return await this.schoolRepository.updateSchool(schoolId, updateData);
        } catch (error) {
            console.error('Error updating school:', error);
            throw new Error('Failed to update school profile');
        }
    }

    async updateSchoolLogo(schoolId: number, logoUrl: string): Promise<School | null> {
        try {
            return await this.schoolRepository.updateSchool(schoolId, {
                logo: logoUrl
            });
        } catch (error) {
            console.error('Error updating school logo:', error);
            throw new Error('Failed to update school logo');
        }
    }

    async verifySchool(schoolId: number): Promise<School | null> {
        try {
            return await this.schoolRepository.updateSchoolVerificationStatus(schoolId, true);
        } catch (error) {
            console.error('Error verifying school:', error);
            throw new Error('Failed to verify school');
        }
    }

    async unverifySchool(schoolId: number): Promise<School | null> {
        try {
            return await this.schoolRepository.updateSchoolVerificationStatus(schoolId, false);
        } catch (error) {
            console.error('Error unverifying school:', error);
            throw new Error('Failed to unverify school');
        }
    }

    async publishSchool(schoolId: number): Promise<School | null> {
        try {
            return await this.schoolRepository.updateSchoolPublishedStatus(schoolId, true);
        } catch (error) {
            console.error('Error publishing school:', error);
            throw new Error('Failed to publish school');
        }
    }

    async unpublishSchool(schoolId: number): Promise<School | null> {
        try {
            return await this.schoolRepository.updateSchoolPublishedStatus(schoolId, false);
        } catch (error) {
            console.error('Error unpublishing school:', error);
            throw new Error('Failed to unpublish school');
        }
    }

    async deleteSchool(schoolId: number): Promise<boolean> {
        try {
            return await this.schoolRepository.deleteSchool(schoolId);
        } catch (error) {
            console.error('Error deleting school:', error);
            throw new Error('Failed to delete school profile');
        }
    }

    async getAllSchools(limit?: number, offset?: number): Promise<School[]> {
        try {
            return await this.schoolRepository.getAllSchools(limit, offset);
        } catch (error) {
            console.error('Error fetching schools:', error);
            throw new Error('Failed to fetch schools');
        }
    }

    async getSchoolsByResort(resortId: number): Promise<School[]> {
        try {
            return await this.schoolRepository.getSchoolsByResort(resortId);
        } catch (error) {
            console.error('Error fetching schools by resort:', error);
            throw new Error('Failed to fetch schools for resort');
        }
    }

    async checkSlugAvailability(slug: string, excludeId?: number): Promise<boolean> {
        try {
            return await this.schoolRepository.checkSlugAvailability(slug, excludeId);
        } catch (error) {
            console.error('Error checking slug availability:', error);
            throw new Error('Failed to check slug availability');
        }
    }

    async getSchoolResorts(schoolId: number): Promise<number[]> {
        try {
            return await this.schoolRepository.getSchoolResorts(schoolId);
        } catch (error) {
            console.error('Error fetching school resorts:', error);
            throw new Error('Failed to fetch school resorts');
        }
    }
}