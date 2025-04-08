import { pgTable, text, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: integer('id').generatedAlwaysAsIdentity(),
	name: varchar('name'),
	
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
