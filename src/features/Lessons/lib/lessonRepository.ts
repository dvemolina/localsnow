import { db } from "$lib/server/db";
import { lessons, lessonSports } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { LessonData, LessonUpdateData, LessonWithSports } from "./lessonSchema";

export class LessonRepository {
    async createLesson(data: LessonData, sportIds: number[]): Promise<LessonWithSports> {
        // Create the lesson
        const [newLesson] = await db
            .insert(lessons)
            .values({
                ...data,
                isPublished: data.isPublished ?? true,
                isBaseLesson: data.isBaseLesson ?? false,
            })
            .returning();

        // Insert sports relationships
        if (sportIds.length > 0) {
            await db.insert(lessonSports).values(
                sportIds.map(sportId => ({
                    lessonId: newLesson.id,
                    sportId
                }))
            );
        }

        return {
            ...newLesson,
            sports: sportIds
        };
    }

    async getLessonById(id: number): Promise<LessonWithSports | null> {
        const [lesson] = await db
            .select()
            .from(lessons)
            .where(eq(lessons.id, id));

        if (!lesson) return null;

        // Get associated sports
        const sports = await db
            .select({ sportId: lessonSports.sportId })
            .from(lessonSports)
            .where(eq(lessonSports.lessonId, id));

        return {
            ...lesson,
            sports: sports.map(s => s.sportId)
        };
    }

    async updateLesson(id: number, data: LessonUpdateData, sportIds?: number[]): Promise<LessonWithSports | null> {
        const [updatedLesson] = await db
            .update(lessons)
            .set({ ...data })
            .where(eq(lessons.id, id))
            .returning();

        if (!updatedLesson) return null;

        // Update sports if provided
        if (sportIds !== undefined) {
            // Delete existing sports
            await db.delete(lessonSports).where(eq(lessonSports.lessonId, id));
            
            // Insert new sports
            if (sportIds.length > 0) {
                await db.insert(lessonSports).values(
                    sportIds.map(sportId => ({
                        lessonId: id,
                        sportId
                    }))
                );
            }
        }

        // Get current sports
        const sports = await db
            .select({ sportId: lessonSports.sportId })
            .from(lessonSports)
            .where(eq(lessonSports.lessonId, id));

        return {
            ...updatedLesson,
            sports: sports.map(s => s.sportId)
        };
    }

    async deleteLesson(id: number): Promise<boolean> {
        // Sports will be deleted automatically due to ON DELETE CASCADE
        const deleted = await db
            .delete(lessons)
            .where(eq(lessons.id, id))
            .returning();

        return deleted.length > 0;
    }

    async listLessonsByInstructor(instructorId: number): Promise<LessonWithSports[]> {
        const instructorLessons = await db
            .select()
            .from(lessons)
            .where(eq(lessons.instructorId, instructorId));

        // Get sports for each lesson
        const lessonsWithSports = await Promise.all(
            instructorLessons.map(async (lesson) => {
                const sports = await db
                    .select({ sportId: lessonSports.sportId })
                    .from(lessonSports)
                    .where(eq(lessonSports.lessonId, lesson.id));

                return {
                    ...lesson,
                    sports: sports.map(s => s.sportId)
                };
            })
        );

        return lessonsWithSports;
    }

    async listAllLessons(): Promise<LessonWithSports[]> {
        const allLessons = await db.select().from(lessons);

        // Get sports for each lesson
        const lessonsWithSports = await Promise.all(
            allLessons.map(async (lesson) => {
                const sports = await db
                    .select({ sportId: lessonSports.sportId })
                    .from(lessonSports)
                    .where(eq(lessonSports.lessonId, lesson.id));

                return {
                    ...lesson,
                    sports: sports.map(s => s.sportId)
                };
            })
        );

        return lessonsWithSports;
    }
}