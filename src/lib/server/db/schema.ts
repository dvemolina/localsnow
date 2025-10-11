import { pgTable, text, integer, timestamp, varchar, uuid, boolean, pgEnum, numeric } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'instructor-independent','instructor-school', 'school-admin', 'client']);
export const sportsEnum = pgEnum('sport', ['Ski', 'Snowboard', 'Telemark'])
export const sportSlugEnum = pgEnum('sport_slug', ['ski', 'snowboard', 'telemark']);
export const modalitySlugEnum = pgEnum('modality_slug', ['piste', 'off-piste', 'freeride', 'freestyle', 'touring', 'adaptive']);

export const timestamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
    deletedAt: timestamp('deleted_at'),
}
// --- Users ---
export const users = pgTable('users', {
    uuid: uuid('uuid').defaultRandom().unique().notNull(),
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	googleId: varchar('google_id').unique(),
    name: varchar('name', { length: 100 }).notNull(),
	lastName: varchar('last_name', { length: 100 }).notNull(),
	username: varchar('username', { length: 50 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: userRoleEnum('role'), 
    bio: text('bio'),
    profileImageUrl: varchar('profile_image_url', { length: 255 }). default('/local-snow-head.png'),
	countryCode: varchar('country_code', { length: 4}),
    phone: varchar('phone', { length: 50 }),
	qualificationUrl: varchar('qualification_url', { length: 255 }),
    isVerified: boolean('is_verified').default(false),
	acceptedTerms: boolean('accepted_terms').notNull().default(false),
	...timestamps
});
// --- Sports ---
export const sports = pgTable('sports', {
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	sport: sportsEnum('sport').notNull().unique(),
	sportSlug: sportSlugEnum('sport_slug').notNull().unique() // e.g. 'ski', 'snowboard'
});

// --- Geography ---
export const countries = pgTable('countries', {
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	country: varchar('country', { length: 100} ).notNull(),
	countryCode: varchar('country_code', { length: 4}).notNull(),
	countrySlug: varchar('country_slug', { length: 100}).notNull().unique()
});

export const regions = pgTable('regions', {
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	countryId: integer('country_id').notNull().references(() => countries.id),
	region: varchar('region', { length: 100} ).notNull(),
	regionSlug: varchar('region_slug', { length: 100}).notNull().unique(),
});

export const resorts = pgTable('resorts', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	name: varchar('name', { length: 100 }).notNull(),
	slug: varchar('slug', { length: 100 }).notNull().unique(),
	label: varchar('label'),
	minElevation: integer('min_elevation'),
	maxElevation: integer('max_elevation'),
	lat: numeric('lat', { precision: 10, scale: 6 }),
	lon: numeric('lon', { precision: 10, scale: 6 }),
	website: varchar('website', { length: 255 }),
	countryId: integer('country_id')
		.notNull()
		.references(() => countries.id, { onDelete: 'cascade' }),
	regionId: integer('region_id')
		.notNull()
		.references(() => regions.id, { onDelete: 'cascade' }),
	...timestamps
});


// --- Schools ---
export const schools = pgTable('schools', {
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	ownerUserId: integer('owner_user_id').notNull().references(() => users.id),
	name: varchar('name', { length: 100 }).notNull(),
	slug: varchar('slug', { length: 100 }).notNull().unique(),
	bio: text('bio'),
	schoolEmail: varchar('school_email', { length: 255 }),
	countryCode: varchar('country_code', { length: 4}).notNull(),
	schoolPhone: varchar('school_phone', { length: 50 }),
	logo: varchar('logo', { length: 255 }),
	isPublished: boolean('is_published').default(true),
	isVerified: boolean('is_verified').default(false)
});

// --- Lessons (future) ---
export const lessons = pgTable('lessons', {
	uuid: uuid('id').defaultRandom().unique().notNull(),
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	title: varchar('title', { length: 100 }),
	description: text('description'),
	basePrice: integer('base_price'),
	currency: varchar('currency', { length: 50 }),
	duration: varchar('duration', { length: 50 }), // e.g. '2h', 'half-day'
	sportId: integer('sport_id').notNull().references(() => sports.id),
	instructorId: integer('instructor_id').references(() => users.id),
	schoolId: integer('school_id').references(() => schools.id),
	isPublished: boolean('is_published').default(true),
	isBaseLesson: boolean('is_base_lesson').default(false)
});

// --- Many-to-Many Relationships ---
export const instructorSports = pgTable('instructor_sports', {
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	sportId: integer('sport_id').notNull().references(() => sports.id)
});

export const instructorResorts = pgTable('instructor_resorts', {
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	resortId: integer('resort_id').notNull().references(() => resorts.id)
});

export const schoolSports = pgTable('school_sports', {
	schoolId: integer('school_id').notNull().references(() => schools.id),
	sportId: integer('sport_id').notNull().references(() => sports.id)
});

export const schoolResorts = pgTable('school_resorts', {
	schoolId: integer('school_id').notNull().references(() => schools.id),
	resortId: integer('resort_id').notNull().references(() => resorts.id)
});

export const schoolAdmins = pgTable('school_admins', {
	schoolId: integer('school_id').notNull().references(() => schools.id),
	userId: integer('user_id').notNull().references(() => users.id),
	isAccepted: boolean('is_accepted').default(false)
});
  
export const schoolInstructors = pgTable('school_instructors', {
	schoolId: integer('school_id').notNull().references(() => schools.id),
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	isAcceptedBySchool: boolean('is_accepted_by_school').default(false),
	isActive: boolean('is_active').default(true)
});

export const schoolInstructorHistory = pgTable('school_instructor_history', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	schoolId: integer('school_id').references(() => schools.id), // Null for independent work
	startDate: timestamp('start_date').defaultNow().notNull(),
	endDate: timestamp('end_date'), // Null means still active
	contractType: varchar('contract_type', { length: 100 }), // e.g., 'full-time', 'seasonal', 'independent'
	notes: text('notes'), // Optional comments or roles
	isIndependent: boolean('is_independent').default(false) // True if the instructor worked independently
});


export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});


//User
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof session.$inferSelect;

//School
export type School = typeof schools.$inferSelect
export type InsertSchool = typeof schools.$inferInsert;
//Countries
export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;
//Regions
export type Region = typeof regions.$inferSelect;
export type InsertRegion = typeof regions.$inferInsert;