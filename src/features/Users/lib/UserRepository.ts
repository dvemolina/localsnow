import { db } from "$lib/server/db/index";
import { users } from "$src/lib/server/db/schema";
import type { User } from "$src/lib/server/db/schema";
import { eq } from "drizzle-orm";


//Contracts tightly coupled with my PostreSQL instance
export class UserRepository {
    async createUser(userData: InsertUser): Promise<User> {
        const result = await db.insert(users).values(userData).returning();
        return result[0];
    }

    async getUserById(userId: number): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, userId));
        return result[0] ?? null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0] ?? null;
    }

    async getUserByGoogleId(googleId: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.googleId, googleId));ç
        return result[0] ?? null;
    }

    async updateUser(userId: number, updatedFields: Partial<InsertUser>): Promise<User | null> {
        const result = await db.update(users).set(updatedFields).where(eq(users.id, userId)).returning();
        return result[0] ?? null;
    }


}
