import { db } from "$lib/server/db";
import { lessons, lessonSports } from "$lib/server/db/schema";
import { eq, sql } from "drizzle-orm";
import type { LessonData, LessonUpdateData, LessonWithSports } from "./lessonSchema";

export class LessonRepository {
    async createLesson(data: LessonData, sportIds: number[]): Promise<LessonWithSports> {
        try {
            // Create the lesson
            const [newLesson] = await db
                .insert(lessons)
                .values({
                    title: data.title ?? null,
                    description: data.description ?? null,
                    basePrice: data.basePrice,
                    currency: data.currency,
                    duration: data.duration ?? '1h',
                    instructorId: data.instructorId ?? null,
                    schoolId: data.schoolId ?? null,
                    isPublished: data.isPublished ?? true,
                    isBaseLesson: data.isBaseLesson ?? false,
                })
                .returning();

            // Insert sports relationships
            if (sportIds && sportIds.length > 0) {
                try {
                    await db.insert(lessonSports).values(
                        sportIds.map(sportId => ({
                            lessonId: newLesson.id,
                            sportId
                        }))
                    );
                } catch (sportsError) {
                    // Delete the lesson we just created since sports failed
                    await db.delete(lessons).where(eq(lessons.id, newLesson.id));
                    throw new Error('Failed to create sports relationships. Please ensure the lesson_sports table exists.');
                }
            }

            return {
                ...newLesson,
                sports: sportIds
            };
        } catch (error) {
            console.error('Error creating lesson:', error);
            throw error;
        }
    }

    async getLessonById(id: number): Promise<LessonWithSports | null> {
        try {
            const [lesson] = await db
                .select()
                .from(lessons)
                .where(eq(lessons.id, id));

            if (!lesson) return null;

            // Get associated sports
            try {
                const sports = await db
                    .select({ sportId: lessonSports.sportId })
                    .from(lessonSports)
                    .where(eq(lessonSports.lessonId, id));

                return {
                    ...lesson,
                    sports: sports.map(s => s.sportId)
                };
            } catch (error) {
                // Return lesson without sports if table doesn't exist
                return {
                    ...lesson,
                    sports: []
                };
            }
        } catch (error) {
            console.error('Error getting lesson by ID:', error);
            throw error;
        }
    }

    async updateLesson(id: number, data: LessonUpdateData, sportIds?: number[]): Promise<LessonWithSports | null> {
        try {
            const [updatedLesson] = await db
                .update(lessons)
                .set({ ...data })
                .where(eq(lessons.id, id))
                .returning();

            if (!updatedLesson) return null;

            // Update sports if provided
            if (sportIds !== undefined) {
                try {
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
                } catch (error) {
                    // Sports update failed but lesson was updated
                }
            }

            // Get current sports
            try {
                const sports = await db
                    .select({ sportId: lessonSports.sportId })
                    .from(lessonSports)
                    .where(eq(lessonSports.lessonId, id));

                return {
                    ...updatedLesson,
                    sports: sports.map(s => s.sportId)
                };
            } catch (error) {
                return {
                    ...updatedLesson,
                    sports: sportIds || []
                };
            }
        } catch (error) {
            console.error('Error updating lesson:', error);
            throw error;
        }
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
        try {
            const instructorLessons = await db
                .select()
                .from(lessons)
                .where(eq(lessons.instructorId, instructorId));

            // Get sports for each lesson
            const lessonsWithSports = await Promise.all(
                instructorLessons.map(async (lesson) => {
                    try {
                        const sports = await db
                            .select({ sportId: lessonSports.sportId })
                            .from(lessonSports)
                            .where(eq(lessonSports.lessonId, lesson.id));

                        return {
                            ...lesson,
                            sports: sports.map(s => s.sportId)
                        };
                    } catch (error) {
                        return {
                            ...lesson,
                            sports: []
                        };
                    }
                })
            );

            return lessonsWithSports;
        } catch (error) {
            console.error('Error listing lessons by instructor:', error);
            throw error;
        }
    }

    async listLessonsBySchool(schoolId: number): Promise<LessonWithSports[]> {
        try {
            const schoolLessons = await db
                .select()
                .from(lessons)
                .where(eq(lessons.schoolId, schoolId));

            // Get sports for each lesson
            const lessonsWithSports = await Promise.all(
                schoolLessons.map(async (lesson) => {
                    try {
                        const sports = await db
                            .select({ sportId: lessonSports.sportId })
                            .from(lessonSports)
                            .where(eq(lessonSports.lessonId, lesson.id));

                        return {
                            ...lesson,
                            sports: sports.map(s => s.sportId)
                        };
                    } catch (error) {
                        return {
                            ...lesson,
                            sports: []
                        };
                    }
                })
            );

            return lessonsWithSports;
        } catch (error) {
            console.error('Error listing lessons by school:', error);
            throw error;
        }
    }

    async listAllLessons(): Promise<LessonWithSports[]> {
        const allLessons = await db.select().from(lessons);

        // Get sports for each lesson
        const lessonsWithSports = await Promise.all(
            allLessons.map(async (lesson) => {
                try {
                    const sports = await db
                        .select({ sportId: lessonSports.sportId })
                        .from(lessonSports)
                        .where(eq(lessonSports.lessonId, lesson.id));

                    return {
                        ...lesson,
                        sports: sports.map(s => s.sportId)
                    };
                } catch (error) {
                    return {
                        ...lesson,
                        sports: []
                    };
                }
            })
        );

        return lessonsWithSports;
    }

}