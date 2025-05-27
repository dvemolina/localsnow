import type { User } from "$src/lib/server/db/schema";
import { InstructorRepository, type InstructorData } from "./instructorRepository";
import type { InstructorSignupData, InstructorSignupSchema } from "./instructorSchemas";



export class InstructorService {
    private instructorRepository: InstructorRepository;

    constructor() {
        this.instructorRepository = new InstructorRepository();
    }

    async createInstructor(instructorData: InstructorSignupData): Promise<User> {
        try {
            return await this.instructorRepository.createInstructor(instructorData);
        } catch (error) {
            console.error('Error creating instructor:', error);
            throw new Error('Failed to create instructor profile');
        }
    }

    async getInstructorById(instructorId: number): Promise<User | null> {
        try {
            return await this.instructorRepository.getInstructorById(instructorId);
        } catch (error) {
            console.error('Error fetching instructor:', error);
            throw new Error('Failed to fetch instructor profile');
        }
    }

    async getInstructorWithRelations(instructorId: number): Promise<{
        instructor: User | null;
        sports: number[];
        resorts: number[];
    }> {
        try {
            const [instructor, sports, resorts] = await Promise.all([
                this.instructorRepository.getInstructorById(instructorId),
                this.instructorRepository.getInstructorSports(instructorId),
                this.instructorRepository.getInstructorResorts(instructorId)
            ]);

            return {
                instructor,
                sports,
                resorts
            };
        } catch (error) {
            console.error('Error fetching instructor with relations:', error);
            throw new Error('Failed to fetch instructor details');
        }
    }

    async updateInstructor(
        instructorId: number,
        formData: Partial<InstructorSignupSchema>,
        profileImageUrl?: string | null,
        qualificationUrl?: string | null
    ): Promise<User | null> {
        try {
            const updateData: Partial<InstructorData> = {
                ...formData,
                profileImageUrl,
                qualificationUrl
            };

            return await this.instructorRepository.updateInstructor(instructorId, updateData);
        } catch (error) {
            console.error('Error updating instructor:', error);
            throw new Error('Failed to update instructor profile');
        }
    }

    async updateInstructorProfileImage(instructorId: number, imageUrl: string): Promise<User | null> {
        try {
            return await this.instructorRepository.updateInstructor(instructorId, {
                profileImageUrl: imageUrl
            });
        } catch (error) {
            console.error('Error updating instructor profile image:', error);
            throw new Error('Failed to update profile image');
        }
    }

    async updateInstructorQualification(instructorId: number, qualificationUrl: string): Promise<User | null> {
        try {
            return await this.instructorRepository.updateInstructor(instructorId, {
                qualificationUrl
            });
        } catch (error) {
            console.error('Error updating instructor qualification:', error);
            throw new Error('Failed to update qualification');
        }
    }

    async deleteInstructor(instructorId: number): Promise<boolean> {
        try {
            return await this.instructorRepository.deleteInstructor(instructorId);
        } catch (error) {
            console.error('Error deleting instructor:', error);
            throw new Error('Failed to delete instructor profile');
        }
    }

    async getInstructorSports(instructorId: number): Promise<number[]> {
        try {
            return await this.instructorRepository.getInstructorSports(instructorId);
        } catch (error) {
            console.error('Error fetching instructor sports:', error);
            throw new Error('Failed to fetch instructor sports');
        }
    }

    async getInstructorResorts(instructorId: number): Promise<number[]> {
        try {
            return await this.instructorRepository.getInstructorResorts(instructorId);
        } catch (error) {
            console.error('Error fetching instructor resorts:', error);
            throw new Error('Failed to fetch instructor resorts');
        }
    }
}