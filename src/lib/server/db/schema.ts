import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, varchar, uuid, boolean, pgEnum, numeric, serial, decimal, uniqueIndex } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'instructor-independent','instructor-school', 'school-admin', 'client']);
export const sportsEnum = pgEnum('sport', ['Ski', 'Snowboard', 'Telemark'])
export const sportSlugEnum = pgEnum('sport_slug', ['ski', 'snowboard', 'telemark']);
export const modalitySlugEnum = pgEnum('modality_slug', ['piste', 'off-piste', 'freeride', 'freestyle', 'touring', 'adaptive']);
export const pricingModeEnum = pgEnum('pricing_mode', ['per_hour', 'per_session', 'per_day']);
export const bookingStatusEnum = pgEnum('status', ['pending', 'viewed', 'accepted', 'rejected', 'cancelled', 'expired', 'completed', 'no_show']);
export const bookingSourceEnum = pgEnum('booking_source', ['platform', 'manual']);

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
	spokenLanguages: text('spoken_languages').array(),
    isVerified: boolean('is_verified').default(false),
	isPublished: boolean('is_published').default(false),
	acceptedTerms: boolean('accepted_terms').notNull().default(false),
	isSuspended: boolean('is_suspended').default(false),
	suspensionReason: text('suspension_reason'),
	suspendedAt: timestamp('suspended_at'),
	lastRoleChange: timestamp('last_role_change'),
	roleChangeCount: integer('role_change_count').default(0),
	...timestamps
});

// --- User Roles (multi-role support) ---
export const userRoles = pgTable('user_roles', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	role: userRoleEnum('role').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
	userRoleUnique: uniqueIndex('user_roles_user_id_role_unique').on(table.userId, table.role)
}));
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
	description: varchar('description'),
	minElevation: integer('min_elevation'),
	maxElevation: integer('max_elevation'),
	lat: numeric('lat', { precision: 10, scale: 6 }),
	lon: numeric('lon', { precision: 10, scale: 6 }),
	website: varchar('website', { length: 255 }),
	image: varchar('image', { length: 255 }),
	countryId: integer('country_id')
		.notNull()
		.references(() => countries.id, { onDelete: 'cascade' }),
	regionId: integer('region_id')
		.references(() => regions.id, { onDelete: 'cascade' }),
	...timestamps
});

// Resort Requests - Instructors can request new resorts to be added
export const resortRequestStatusEnum = pgEnum('resort_request_status', ['pending', 'approved', 'rejected']);

export const resortRequests = pgTable('resort_requests', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	// Requester info
	requesterId: integer('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	requesterEmail: varchar('requester_email', { length: 255 }).notNull(),
	requesterName: varchar('requester_name', { length: 100 }).notNull(),
	// Resort details
	resortName: varchar('resort_name', { length: 100 }).notNull(),
	countryId: integer('country_id').references(() => countries.id, { onDelete: 'set null' }),
	regionId: integer('region_id').references(() => regions.id, { onDelete: 'set null' }),
	website: varchar('website', { length: 255 }),
	additionalInfo: text('additional_info'), // Any extra details from the instructor
	// Status and processing
	status: resortRequestStatusEnum('status').notNull().default('pending'),
	reviewedByAdminId: integer('reviewed_by_admin_id').references(() => users.id, { onDelete: 'set null' }),
	reviewedAt: timestamp('reviewed_at'),
	rejectionReason: text('rejection_reason'), // If rejected, why
	createdResortId: integer('created_resort_id').references(() => resorts.id, { onDelete: 'set null' }), // Link to created resort if approved
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
	schoolId: integer('school_id').references(() => schools.id, { onDelete: 'set null' }), // If booked through school
	lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'set null' }), // Reference to lesson for manual bookings

    // Client info
    clientUserId: integer('client_user_id').references(() => users.id, { onDelete: 'set null' }), // Authenticated user reference
    clientName: varchar('client_name', { length: 100 }).notNull(),
    clientEmail: varchar('client_email', { length: 255 }),
	clientCountryCode: varchar('client_country_code', { length: 4 }),
    clientPhone: varchar('client_phone', { length: 50 }),

    // Lesson details
    numberOfStudents: integer('number_of_students').notNull().default(1),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'), // null for single-day bookings
    hoursPerDay: numeric('hours_per_day', { precision: 4, scale: 1 }).notNull(),
	timeSlots: text('time_slots'), // JSON array of time slots

	// Additional info
	skillLevel: varchar('skill_level', { length: 50 }),
	message: text('message'),
	promoCode: varchar('promo_code', { length: 50 }),
	bookingIdentifier: varchar('booking_identifier', { length: 100 }), // Internal booking label

    // Pricing estimate (for reference)
    estimatedPrice: integer('estimated_price'),
    currency: varchar('currency', { length: 50 }),

	// Client management fields
	source: bookingSourceEnum('source').notNull().default('platform'), // platform or manual
	manualPrice: integer('manual_price'), // For manual bookings with custom price
	notes: text('notes'), // Private notes for instructor

	//Lead info after payment
	contactInfoUnlocked: boolean('contact_info_unlocked').notNull().default(false),

	// Review system
	reviewToken: varchar('review_token', { length: 255 }),
	reviewSubmittedAt: timestamp('review_submitted_at'),

    // Beta launch tracking
    usedLaunchCode: varchar('used_launch_code', { length: 50 }), // Track if beta code was used

    status: bookingStatusEnum('status').default('pending'),
    ...timestamps
});

// User Booking Request Limits - Track how many active requests a user has
export const userBookingLimits = pgTable('user_booking_limits', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	clientEmail: varchar('client_email', { length: 255 }).notNull(), // For non-authenticated users
	activeRequestsCount: integer('active_requests_count').default(0),
	lastRequestAt: timestamp('last_request_at'),
	...timestamps
});

// Add unique constraint on email
export const userBookingLimitsRelations = relations(userBookingLimits, ({ one }) => ({
	user: one(users, {
		fields: [userBookingLimits.userId],
		references: [users.id]
	})
}));

export type UserBookingLimit = typeof userBookingLimits.$inferSelect;
export type InsertUserBookingLimit = typeof userBookingLimits.$inferInsert;

// --- Instructor Reviews ---
export const instructorReviews = pgTable('instructor_reviews', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	reviewerId: integer('reviewer_id').references(() => users.id, { onDelete: 'set null' }), // Optional: if reviewer was logged in
	bookingId: integer('booking_id').references(() => bookingRequests.id, { onDelete: 'set null' }),
	reviewerName: varchar('reviewer_name', { length: 100 }), // Public display name for the review
	clientName: varchar('client_name', { length: 100 }),
	clientEmail: varchar('client_email', { length: 255 }),
	rating: integer('rating').notNull(), // 1-5
	comment: text('comment'),
	isVerified: boolean('is_verified').notNull().default(false), // Verified = linked to a real booking
	isPublished: boolean('is_published').notNull().default(false), // Only published reviews show on profile
	...timestamps
});

export const instructorReviewsRelations = relations(instructorReviews, ({ one }) => ({
	instructor: one(users, {
		fields: [instructorReviews.instructorId],
		references: [users.id]
	}),
	reviewer: one(users, {
		fields: [instructorReviews.reviewerId],
		references: [users.id]
	}),
	booking: one(bookingRequests, {
		fields: [instructorReviews.bookingId],
		references: [bookingRequests.id]
	})
}));

export type InstructorReview = typeof instructorReviews.$inferSelect;
export type InsertInstructorReview = typeof instructorReviews.$inferInsert;

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

// Group Pricing Tiers Table
export const groupPricingTiers = pgTable('group_pricing_tiers', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
	minStudents: integer('min_students').notNull(),
	maxStudents: integer('max_students').notNull(),
	pricePerHour: integer('price_per_hour').notNull(),
	...timestamps
});

// Duration Packages Table
export const durationPackages = pgTable('duration_packages', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }).notNull(),
	hours: numeric('hours', { precision: 4, scale: 1 }).notNull(),
	price: integer('price').notNull(),
	minStudents: integer('min_students').default(1),
	maxStudents: integer('max_students').default(6),
	description: text('description'),
	...timestamps
});

// Promo Codes Table
export const promoCodes = pgTable('promo_codes', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	instructorId: integer('instructor_id').references(() => users.id, { onDelete: 'cascade' }),
	lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
	code: varchar('code', { length: 50 }).notNull().unique(),
	discountPercent: integer('discount_percent').notNull(),
	validUntil: timestamp('valid_until'),
	maxUses: integer('max_uses'),
	currentUses: integer('current_uses').default(0),
	...timestamps
});

//Lead Payments
export const leadPayments = pgTable('lead_payments', {
	id: serial('id').primaryKey(),
	bookingRequestId: integer('booking_request_id').notNull().references(() => bookingRequests.id),
	instructorId: integer('instructor_id').notNull().references(() => users.id),
	amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
	currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
	stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
	stripeCheckoutSessionId: varchar('stripe_checkout_session_id', { length: 255 }),
	status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, paid, failed, refunded
	usedLaunchCode: varchar('used_launch_code', { length: 50 }), // Track if beta code was used
	paidAt: timestamp('paid_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const leadPaymentsRelations = relations(leadPayments, ({ one }) => ({
	bookingRequest: one(bookingRequests, {
		fields: [leadPayments.bookingRequestId],
		references: [bookingRequests.id]
	}),
	instructor: one(users, {
		fields: [leadPayments.instructorId],
		references: [users.id]
	})
}));

// Client Deposits
export const clientDeposits = pgTable('client_deposits', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	bookingRequestId: integer('booking_request_id').notNull().references(() => bookingRequests.id, { onDelete: 'cascade' }),
    clientEmail: varchar('client_email', { length: 255 }),
	amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
	currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
	stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
	status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, held, refunded, forfeited, expired
	refundedAt: timestamp('refunded_at'),
	forfeitedAt: timestamp('forfeited_at'),
	expiresAt: timestamp('expires_at').notNull(), // 48h from creation
	...timestamps
});

export const clientDepositsRelations = relations(clientDeposits, ({ one }) => ({
	bookingRequest: one(bookingRequests, {
		fields: [clientDeposits.bookingRequestId],
		references: [bookingRequests.id]
	})
}));

export type ClientDeposit = typeof clientDeposits.$inferSelect;
export type InsertClientDeposit = typeof clientDeposits.$inferInsert;

// Launch Codes (Beta Access System)
export const launchCodes = pgTable('launch_codes', {
	id: serial('id').primaryKey(),
	code: varchar('code', { length: 50 }).notNull().unique(),
	description: text('description'),
	validUntil: timestamp('valid_until').notNull(),
	isActive: boolean('is_active').notNull().default(true),
	maxUses: integer('max_uses'), // null = unlimited
	currentUses: integer('current_uses').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export type LaunchCode = typeof launchCodes.$inferSelect;
export type InsertLaunchCode = typeof launchCodes.$inferInsert;

// Reviews
export const reviews = pgTable('reviews', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	bookingRequestId: integer('booking_request_id').notNull().unique().references(() => bookingRequests.id, { onDelete: 'cascade' }), // One review per booking
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	clientEmail: varchar('client_email', { length: 255 }).notNull(),
	rating: integer('rating').notNull(), // 1-5 stars
	comment: text('comment'),
	isVerified: boolean('is_verified').default(true), // All reviews are verified (require valid booking)
	...timestamps
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
	bookingRequest: one(bookingRequests, {
		fields: [reviews.bookingRequestId],
		references: [bookingRequests.id]
	}),
	instructor: one(users, {
		fields: [reviews.instructorId],
		references: [users.id]
	})
}));

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// --- Instructor Leads (Contact Form Submissions) ---
export const instructorLeads = pgTable('instructor_leads', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	clientName: varchar('client_name', { length: 100 }),
	clientEmail: varchar('client_email', { length: 255 }).notNull(),
	clientPhone: varchar('client_phone', { length: 20 }),
	message: text('message').notNull(),
	preferredDates: text('preferred_dates'), // Optional: when client wants to ski
	numberOfStudents: integer('number_of_students'), // Optional: group size
	skillLevel: varchar('skill_level', { length: 20 }), // Optional: beginner, intermediate, advanced
	status: varchar('status', { length: 20 }).default('new').notNull(), // new, contacted, converted, spam
	...timestamps
});

export const instructorLeadsRelations = relations(instructorLeads, ({ one }) => ({
	instructor: one(users, {
		fields: [instructorLeads.instructorId],
		references: [users.id]
	})
}));

export type InstructorLead = typeof instructorLeads.$inferSelect;
export type InsertInstructorLead = typeof instructorLeads.$inferInsert;

// --- Availability System Tables ---

// Working Hours (one-time setup per instructor)
export const instructorWorkingHours = pgTable('instructor_working_hours', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 6=Saturday
	startTime: varchar('start_time', { length: 5 }).notNull(), // "09:00"
	endTime: varchar('end_time', { length: 5 }).notNull(), // "17:00"
	seasonStart: timestamp('season_start'), 
	seasonEnd: timestamp('season_end'),
	isActive: boolean('is_active').default(true),
	...timestamps
});

// Calendar Blocks (synced from Google + booking blocks)
export const instructorCalendarBlocks = pgTable('instructor_calendar_blocks', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	startDatetime: timestamp('start_datetime').notNull(),
	endDatetime: timestamp('end_datetime').notNull(),
	allDay: boolean('all_day').default(false),
	source: varchar('source', { length: 50 }).notNull(), // 'google_calendar' | 'booking_pending' | 'booking_confirmed' | 'manual'
	bookingRequestId: integer('booking_request_id').references(() => bookingRequests.id, { onDelete: 'cascade' }),
	googleEventId: varchar('google_event_id', { length: 255 }),
	title: varchar('title', { length: 255 }),
	expiresAt: timestamp('expires_at'), // For pending bookings (48h)
	...timestamps
});

// Google OAuth Tokens (encrypted storage)
export const instructorGoogleTokens = pgTable('instructor_google_tokens', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	instructorId: integer('instructor_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
	accessToken: text('access_token').notNull(), // Encrypted
	refreshToken: text('refresh_token').notNull(), // Encrypted
	tokenExpiry: timestamp('token_expiry').notNull(),
	calendarId: varchar('calendar_id', { length: 255 }).default('primary'),
	lastSyncAt: timestamp('last_sync_at'),
	syncEnabled: boolean('sync_enabled').default(true),
	...timestamps
});


// --- Many-to-Many Relationships ---

export const lessonSports = pgTable('lesson_sports', {
	lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
	sportId: integer('sport_id').notNull().references(() => sports.id, { onDelete: 'cascade' })
});

export const bookingRequestSports = pgTable('booking_request_sports', {
    bookingRequestId: integer('booking_request_id').notNull().references(() => bookingRequests.id, { onDelete: 'cascade' }),
    sportId: integer('sport_id').notNull().references(() => sports.id, { onDelete: 'cascade' })
});

export const instructorSports = pgTable('instructor_sports', {
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	sportId: integer('sport_id').notNull().references(() => sports.id)
});

export const instructorResorts = pgTable('instructor_resorts', {
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	resortId: integer('resort_id').notNull().references(() => resorts.id, { onDelete: 'cascade' })
});

export const schoolSports = pgTable('school_sports', {
	schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
	sportId: integer('sport_id').notNull().references(() => sports.id, { onDelete: 'cascade' })
});

export const schoolResorts = pgTable('school_resorts', {
	schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
	resortId: integer('resort_id').notNull().references(() => resorts.id, { onDelete: 'cascade' })
});

export const schoolAdmins = pgTable('school_admins', {
	schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	isAccepted: boolean('is_accepted').default(false),
	isOwner: boolean('is_owner').default(false),
	...timestamps
});

export const schoolInstructors = pgTable('school_instructors', {
	schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
	instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	requestedBy: varchar('requested_by', { length: 20 }), // 'school' or 'instructor'
	isAcceptedBySchool: boolean('is_accepted_by_school').default(false),
	isActive: boolean('is_active').default(true),
	requestedAt: timestamp('requested_at').defaultNow().notNull(),
	acceptedAt: timestamp('accepted_at'),
	rejectedAt: timestamp('rejected_at'),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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

// Admin Audit Log
export const adminAuditLog = pgTable('admin_audit_log', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	adminId: integer('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	action: varchar('action', { length: 100 }).notNull(), // 'verify_instructor', 'suspend_user', 'delete_review', etc.
	targetType: varchar('target_type', { length: 50 }), // 'user', 'booking', 'review', 'resort', etc.
	targetId: integer('target_id'), // ID of the affected entity
	details: text('details'), // JSON string with action details
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: text('user_agent'),
	...timestamps
});

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
	admin: one(users, {
		fields: [adminAuditLog.adminId],
		references: [users.id]
	})
}));

export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLog.$inferInsert;

// Role Transition Archive - Stores complete snapshots of user state during role transitions
export const roleTransitionArchive = pgTable('role_transition_archive', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	adminId: integer('admin_id').references(() => users.id),
	fromRole: userRoleEnum('from_role'),
	toRole: userRoleEnum('to_role').notNull(),

	// Snapshot of user data at time of transition
	archivedUserData: text('archived_user_data').notNull(), // JSON string of full user row before transition

	// Archived relationships
	archivedSports: integer('archived_sports').array(), // Sport IDs if was instructor
	archivedResorts: integer('archived_resorts').array(), // Resort IDs if was instructor
	archivedSchoolId: integer('archived_school_id'), // School ID if was school-admin

	// Metadata
	transitionReason: text('transition_reason'),
	canRestore: boolean('can_restore').default(true), // Can be restored within 90 days
	restoredAt: timestamp('restored_at'),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	expiresAt: timestamp('expires_at') // Set to created_at + 90 days
});

export const roleTransitionArchiveRelations = relations(roleTransitionArchive, ({ one }) => ({
	user: one(users, {
		fields: [roleTransitionArchive.userId],
		references: [users.id]
	}),
	admin: one(users, {
		fields: [roleTransitionArchive.adminId],
		references: [users.id]
	})
}));

export type RoleTransitionArchive = typeof roleTransitionArchive.$inferSelect;
export type InsertRoleTransitionArchive = typeof roleTransitionArchive.$inferInsert;

// Role Transition Blocks - Tracks blocking conditions that prevent role changes
export const roleTransitionBlocks = pgTable('role_transition_blocks', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	blockType: varchar('block_type', { length: 50 }).notNull(), // 'active_bookings', 'school_has_instructors', etc.
	blockData: text('block_data'), // JSON string with details about the block (booking IDs, etc.)
	resolved: boolean('resolved').default(false),
	resolvedAt: timestamp('resolved_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const roleTransitionBlocksRelations = relations(roleTransitionBlocks, ({ one }) => ({
	user: one(users, {
		fields: [roleTransitionBlocks.userId],
		references: [users.id]
	})
}));

export type RoleTransitionBlock = typeof roleTransitionBlocks.$inferSelect;
export type InsertRoleTransitionBlock = typeof roleTransitionBlocks.$inferInsert;

// FAQs (Frequently Asked Questions)
export const faqs = pgTable('faqs', {
	id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
	uuid: uuid('uuid').defaultRandom().unique().notNull(),
	// Target entity (resort, instructor, school, etc.)
	entityType: varchar('entity_type', { length: 50 }).notNull(), // 'resort', 'instructor', 'school', 'global'
	entityId: integer('entity_id'), // ID of the resort/instructor/school, null for global FAQs
	// FAQ content
	question: text('question').notNull(),
	answer: text('answer').notNull(),
	// Display settings
	displayOrder: integer('display_order').default(0),
	isPublished: boolean('is_published').default(true),
	// Metadata
	...timestamps
});

export const faqsRelations = relations(faqs, ({ one }) => ({
	resort: one(resorts, {
		fields: [faqs.entityId],
		references: [resorts.id]
	}),
	instructor: one(users, {
		fields: [faqs.entityId],
		references: [users.id]
	}),
	school: one(schools, {
		fields: [faqs.entityId],
		references: [schools.id]
	})
}));

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;

// --- Additional Relations for Drizzle Queries ---

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
	resorts: many(instructorResorts),
	sports: many(instructorSports),
	lessons: many(lessons),
	bookings: many(bookingRequests),
	reviews: many(reviews)
}));

// Resorts relations
export const resortsRelations = relations(resorts, ({ one, many }) => ({
	country: one(countries, {
		fields: [resorts.countryId],
		references: [countries.id]
	}),
	region: one(regions, {
		fields: [resorts.regionId],
		references: [regions.id]
	}),
	instructors: many(instructorResorts),
	resortRequests: many(resortRequests)
}));

// Resort Requests relations
export const resortRequestsRelations = relations(resortRequests, ({ one }) => ({
	requester: one(users, {
		fields: [resortRequests.requesterId],
		references: [users.id]
	}),
	country: one(countries, {
		fields: [resortRequests.countryId],
		references: [countries.id]
	}),
	region: one(regions, {
		fields: [resortRequests.regionId],
		references: [regions.id]
	}),
	reviewedByAdmin: one(users, {
		fields: [resortRequests.reviewedByAdminId],
		references: [users.id]
	}),
	createdResort: one(resorts, {
		fields: [resortRequests.createdResortId],
		references: [resorts.id]
	})
}));

// Regions relations
export const regionsRelations = relations(regions, ({ one, many }) => ({
	country: one(countries, {
		fields: [regions.countryId],
		references: [countries.id]
	}),
	resorts: many(resorts)
}));

// Countries relations
export const countriesRelations = relations(countries, ({ many }) => ({
	regions: many(regions),
	resorts: many(resorts)
}));

// Sports relations
export const sportsRelations = relations(sports, ({ many }) => ({
	instructors: many(instructorSports),
	lessons: many(lessonSports),
	bookingRequests: many(bookingRequestSports)
}));

// InstructorResorts relations
export const instructorResortsRelations = relations(instructorResorts, ({ one }) => ({
	instructor: one(users, {
		fields: [instructorResorts.instructorId],
		references: [users.id]
	}),
	resort: one(resorts, {
		fields: [instructorResorts.resortId],
		references: [resorts.id]
	})
}));

// InstructorSports relations
export const instructorSportsRelations = relations(instructorSports, ({ one }) => ({
	instructor: one(users, {
		fields: [instructorSports.instructorId],
		references: [users.id]
	}),
	sport: one(sports, {
		fields: [instructorSports.sportId],
		references: [sports.id]
	})
}));

// BookingRequests relations
export const bookingRequestsRelations = relations(bookingRequests, ({ one, many }) => ({
	instructor: one(users, {
		fields: [bookingRequests.instructorId],
		references: [users.id]
	}),
	school: one(schools, {
		fields: [bookingRequests.schoolId],
		references: [schools.id]
	}),
	sports: many(bookingRequestSports),
	deposit: one(clientDeposits),
	leadPayment: one(leadPayments),
	review: one(reviews)
}));

// BookingRequestSports relations
export const bookingRequestSportsRelations = relations(bookingRequestSports, ({ one }) => ({
	bookingRequest: one(bookingRequests, {
		fields: [bookingRequestSports.bookingRequestId],
		references: [bookingRequests.id]
	}),
	sport: one(sports, {
		fields: [bookingRequestSports.sportId],
		references: [sports.id]
	})
}));

// Lessons relations
export const lessonsRelations = relations(lessons, ({ one, many }) => ({
	instructor: one(users, {
		fields: [lessons.instructorId],
		references: [users.id]
	}),
	school: one(schools, {
		fields: [lessons.schoolId],
		references: [schools.id]
	}),
	sports: many(lessonSports)
}));

// Type exports
export type GroupPricingTier = typeof groupPricingTiers.$inferSelect;
export type InsertGroupPricingTier = typeof groupPricingTiers.$inferInsert;
export type DurationPackage = typeof durationPackages.$inferSelect;
export type InsertDurationPackage = typeof durationPackages.$inferInsert;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;

//User
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof session.$inferSelect;

//School
export type School = typeof schools.$inferSelect
export type InsertSchool = typeof schools.$inferInsert;
export type SchoolAdmin = typeof schoolAdmins.$inferSelect;
export type InsertSchoolAdmin = typeof schoolAdmins.$inferInsert;
export type SchoolInstructor = typeof schoolInstructors.$inferSelect;
export type InsertSchoolInstructor = typeof schoolInstructors.$inferInsert;
export type SchoolInstructorHistory = typeof schoolInstructorHistory.$inferSelect;
export type InsertSchoolInstructorHistory = typeof schoolInstructorHistory.$inferInsert;
//Countries
export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;
//Regions
export type Region = typeof regions.$inferSelect;
export type InsertRegion = typeof regions.$inferInsert;
//Resorts
export type Resort = typeof resorts.$inferSelect;
export type InsertResort = typeof resorts.$inferInsert;

//Pricing
export type ConditionalPricing = typeof conditionalPricing.$inferSelect;
export type InsertConditionalPricing = typeof conditionalPricing.$inferInsert;
export type PromotionalPricing = typeof promotionalPricing.$inferSelect;
export type InsertPromotionalPricing = typeof promotionalPricing.$inferInsert;

//Bookings
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type InsertBookingRequest = typeof bookingRequests.$inferInsert;

//Availability
export type InstructorWorkingHours = typeof instructorWorkingHours.$inferSelect;
export type InsertInstructorWorkingHours = typeof instructorWorkingHours.$inferInsert;
export type InstructorCalendarBlock = typeof instructorCalendarBlocks.$inferSelect;
export type InsertInstructorCalendarBlock = typeof instructorCalendarBlocks.$inferInsert;
export type InstructorGoogleToken = typeof instructorGoogleTokens.$inferSelect;
export type InsertInstructorGoogleToken = typeof instructorGoogleTokens.$inferInsert;

// Resort Requests
export type ResortRequest = typeof resortRequests.$inferSelect;
export type InsertResortRequest = typeof resortRequests.$inferInsert;
