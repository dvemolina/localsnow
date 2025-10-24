import type { LessonData, LessonUpdateData, LessonWithSports } from "./lessonSchema";
import { LessonRepository } from "./lessonRepository";

export class LessonService {
    private lessonRepository = new LessonRepository();

    async createLesson(data: LessonData, sportIds: number[]): Promise<LessonWithSports> {
        try {
            return await this.lessonRepository.createLesson(data, sportIds);
        } catch (error) {
            console.error("Error creating lesson:", error);
            throw new Error("Failed to create lesson");
        }
    }

    async getLessonById(id: number): Promise<LessonWithSports | null> {
        try {
            return await this.lessonRepository.getLessonById(id);
        } catch (error) {
            console.error("Error fetching lesson:", error);
            throw new Error("Failed to fetch lesson");
        }
    }

    async updateLesson(id: number, data: LessonUpdateData, sportIds?: number[]): Promise<LessonWithSports | null> {
        try {
            return await this.lessonRepository.updateLesson(id, data, sportIds);
        } catch (error) {
            console.error("Error updating lesson:", error);
            throw new Error("Failed to update lesson");
        }
    }

    async deleteLesson(id: number): Promise<boolean> {
        try {
            return await this.lessonRepository.deleteLesson(id);
        } catch (error) {
            console.error("Error deleting lesson:", error);
            throw new Error("Failed to delete lesson");
        }
    }

    async listLessonsByInstructor(instructorId: number): Promise<LessonWithSports[]> {
        try {
            return await this.lessonRepository.listLessonsByInstructor(instructorId);
        } catch (error) {
            console.error("Error listing lessons by instructor:", error);
            throw new Error("Failed to list lessons");
        }
    }

    async listAllLessons(): Promise<LessonWithSports[]> {
        try {
            return await this.lessonRepository.listAllLessons();
        } catch (error) {
            console.error("Error listing all lessons:", error);
            throw new Error("Failed to list lessons");
        }
    }
}