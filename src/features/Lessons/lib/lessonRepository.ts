import { db } from "$lib/server/db";
import { lessons } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { LessonData, LessonUpdateData } from "./lessonSchemas";

export class LessonRepository {
    async createLesson(data: LessonData) {
        const [newLesson] = await db
            .insert(lessons)
            .values({
                ...data,
                isPublished: data.isPublished ?? true,
                isBaseLesson: data.isBaseLesson ?? false,
            })
            .returning();

        return newLesson;
    }

    async getLessonById(id: number) {
        const [lesson] = await db
            .select()
            .from(lessons)
            .where(eq(lessons.id, id));

        return lesson ?? null;
    }

    async updateLesson(id: number, data: LessonUpdateData) {
        const [updatedLesson] = await db
            .update(lessons)
            .set({ ...data })
            .where(eq(lessons.id, id))
            .returning();

        return updatedLesson ?? null;
    }

    async deleteLesson(id: number): Promise<boolean> {
        const deleted = await db
            .delete(lessons)
            .where(eq(lessons.id, id))
            .returning();

        return deleted.length > 0;
    }

    async listLessonsByInstructor(instructorId: number) {
        return await db
            .select()
            .from(lessons)
            .where(eq(lessons.instructorId, instructorId));
    }

    async listAllLessons() {
        return await db.select().from(lessons);
    }
}
