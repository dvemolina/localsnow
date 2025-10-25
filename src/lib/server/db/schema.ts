import { pgTable, text, integer, timestamp, varchar, uuid, boolean, pgEnum, numeric } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'instructor-independent','instructor-school', 'school-admin', 'client']);
export const sportsEnum = pgEnum('sport', ['Ski', 'Snowboard', 'Telemark'])
export const sportSlugEnum = pgEnum('sport_slug', ['ski', 'snowboard', 'telemark']);
export const modalitySlugEnum = pgEnum('modality_slug', ['piste', 'off-piste', 'freeride', 'freestyle', 'touring', 'adaptive']);
export const pricingModeEnum = pgEnum('pricing_mode', ['per_hour', 'per_session', 'per_day']);

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
	professionalCountryCode: varchar('professional_country_code', { length: 4}),
	professionalPhone: varchar('professional_phone', { length: 50 }),
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

// --- Booking Requests ---
export const bookingRequests = pgTable('booking_requests', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid('uuid').defaultRandom().unique().notNull(),
    instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    clientName: varchar('client_name', { length: 100 }).notNull(),
    clientEmail: varchar('client_email', { length: 255 }).notNull(),
    clientPhone: varchar('client_phone', { length: 50 }),
    preferredDate: timestamp('preferred_date').notNull(),
    lessonType: varchar('lesson_type', { length: 100 }),
    numberOfPeople: integer('number_of_people').default(1),
    skillLevel: varchar('skill_level', { length: 50 }),
    message: text('message'),
    status: varchar('status', { length: 50 }).default('pending'),
    ...timestamps
});


// --- Lessons ---
export const lessons = pgTable('lessons', {
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	title: varchar('title', { length: 100 }),
	description: text('description'),
	basePrice: integer('base_price'),
	currency: varchar('currency', { length: 50 }),
	duration: varchar('duration', { length: 50 }),
	instructorId: integer('instructor_id').references(() => users.id),
	schoolId: integer('school_id').references(() => schools.id),
	isPublished: boolean('is_published').default(true),
	isBaseLesson: boolean('is_base_lesson').default(false),
	...timestamps 
});


export const pricingModes = pgTable('pricing_modes', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	mode: pricingModeEnum('mode').notNull().unique(),
	label: varchar('label', { length: 100 }).notNull(),
	description: text('description')
});

// --- Conditional Pricing (e.g., group discounts, duration discounts) ---
export const conditionalPricing = pgTable('conditional_pricing', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
	conditionType: varchar('condition_type', { length: 50 }).notNull(), // 'students', 'duration', 'date_range'
	minValue: integer('min_value'), // e.g., min 2 students, min 2 hours
	maxValue: integer('max_value'), // e.g., max 10 students, max 8 hours
	adjustmentType: varchar('adjustment_type', { length: 50 }).notNull(), // 'percentage', 'fixed_amount', 'multiplier'
	adjustmentValue: numeric('adjustment_value', { precision: 10, scale: 2 }).notNull(),
	priority: integer('priority').default(0), // Higher priority rules apply first
	isActive: boolean('is_active').default(true),
	...timestamps
});

// --- Promotional Pricing (e.g., seasonal discounts, promo codes) ---
export const promotionalPricing = pgTable('promotional_pricing', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }), // null = applies to all lessons
	instructorId: integer('instructor_id').references(() => users.id, { onDelete: 'cascade' }), // null = applies to all instructors
	code: varchar('code', { length: 50 }).unique(), // null if no code required (automatic discount)
	discountType: varchar('discount_type', { length: 50 }).notNull(), // 'percentage', 'fixed_amount'
	discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
	startDate: timestamp('start_date'),
	endDate: timestamp('end_date'),
	maxUses: integer('max_uses'), // null = unlimited
	currentUses: integer('current_uses').default(0),
	minPurchaseAmount: numeric('min_purchase_amount', { precision: 10, scale: 2 }),
	isActive: boolean('is_active').default(true),
	...timestamps
});


// --- Lesson Sports Junction Table ---
export const lessonSports = pgTable('lesson_sports', {
	lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
	sportId: integer('sport_id').notNull().references(() => sports.id, { onDelete: 'cascade' })
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

export const profileVisits = pgTable('profile_visits', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    instructorId: integer('instructor_id').notNull(),
    visitorIp: varchar('visitor_ip', { length: 45 }).notNull(),
    yearMonth: varchar('year_month', { length: 7 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
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

//Pricing
export type ConditionalPricing = typeof conditionalPricing.$inferSelect;
export type InsertConditionalPricing = typeof conditionalPricing.$inferInsert;
export type PromotionalPricing = typeof promotionalPricing.$inferSelect;
export type InsertPromotionalPricing = typeof promotionalPricing.$inferInsert;

//Bookings
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type InsertBookingRequest = typeof bookingRequests.$inferInsert;