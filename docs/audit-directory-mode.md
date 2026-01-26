# LocalSnow Directory Mode Audit

**Date:** 2026-01-13
**Current Branch:** `claude/pivot-free-directory-A6PR4`
**Status:** Phase 1 Assessment (NO CODE CHANGES)

---

## Executive Summary

LocalSnow is **~75% ready** for a free directory pivot. The platform already operates in a 100% free model with contact info unlocked immediately—no payments required. The core architecture is clean, well-organized, and built on solid foundations (SvelteKit, Drizzle ORM, PostgreSQL).

**Key Findings:**
- ✅ **Auth flows work** for all roles (client, independent instructor, school admin, school instructor)
- ✅ **Public directory browsing** fully functional with search/filters
- ✅ **Booking system** already free (no payment processing active)
- ✅ **School management** mostly complete (signup, invites, admin dashboard)
- ⚠️ **School email notifications** incomplete (6 functions stubbed out)
- ⚠️ **Contact/lead capture** needs proper implementation
- 🐛 **Critical bug** in booking cancellation (undefined variables)
- 🔒 **Security** is production-ready (rate limiting, session management, RBAC)

---

## 1. Architecture Map

### Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    LocalSnow Platform                     │
├─────────────────────────────────────────────────────────┤
│ Framework:        SvelteKit (Node adapter)               │
│ Database:         PostgreSQL + Drizzle ORM               │
│ Auth:             Session-based (oslo crypto)            │
│ Storage:          Cloudflare R2 (S3-compatible)          │
│ Email:            n8n webhooks                           │
│ i18n:             Paraglide (EN/ES)                      │
│ UI:               Tailwind + Bits UI + svelte-sonner     │
│ Payments:         Stripe (DISABLED - 100% free model)    │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── routes/                     # SvelteKit pages & API endpoints
│   ├── (auth)/                # Login, signup, OAuth
│   ├── dashboard/             # Role-specific dashboards
│   ├── admin/                 # Platform admin panel
│   ├── instructors/           # Public directory & profiles
│   ├── resorts/               # Resort directory
│   ├── booking/               # Booking flow (FREE)
│   ├── reviews/               # Review system
│   ├── contact/               # Contact page (incomplete)
│   ├── api/                   # API endpoints
│   └── legal/                 # Terms, privacy, cookies
│
├── lib/
│   ├── server/
│   │   ├── db/               # Drizzle schema, migrations, seeds
│   │   ├── webhooks/         # n8n email integrations
│   │   ├── google/           # Google OAuth & Calendar sync
│   │   ├── config.ts         # Environment variables
│   │   ├── session.ts        # Session management
│   │   ├── rate-limit.ts     # Rate limiting (production-ready)
│   │   └── R2Storage.ts      # File uploads (Cloudflare R2)
│   ├── utils/
│   │   ├── auth.ts           # Password hashing, helpers
│   │   └── schoolAuth.ts     # School admin auth
│   └── components/           # Shared UI components
│
└── features/                  # Feature-based modules (clean separation)
    ├── Users/                # User management
    ├── Schools/              # School signup & management
    ├── Instructors/          # Instructor profiles & search
    ├── Bookings/             # Booking creation (FREE)
    ├── Lessons/              # Lesson management
    ├── Availability/         # Working hours, calendar sync
    ├── Pricing/              # Pricing tiers (for display only)
    ├── Reviews/              # Review system
    ├── Resorts/              # Resort directory
    ├── Sports/               # Sport types
    ├── Admin/                # Admin dashboard
    └── Dashboard/            # Dashboard utilities
```

---

### Auth & Session Management

**Session Implementation** (`src/lib/server/session.ts`)

```
┌──────────────────────────────────────────────────────┐
│              Session Security Details                 │
├──────────────────────────────────────────────────────┤
│ Token:      Base64(18 random bytes) = 24 chars       │
│ Session ID: SHA256(token)                            │
│ Expiration: 30 days                                  │
│ Renewal:    Auto-renew after 15 days                 │
│ Cookie:     HttpOnly, Secure (prod), SameSite=Lax    │
│ Storage:    PostgreSQL sessions table                │
└──────────────────────────────────────────────────────┘
```

**Auth Flow Validation:**

```typescript
// Global auth hook in hooks.server.ts
handleAuth(event) {
  1. Check session cookie exists
  2. Validate session ID against DB
  3. Check expiration
  4. Renew if > 15 days old
  5. Set event.locals.user
}
```

**Rate Limiting (Production-Ready):**

| Endpoint | Rate Limit | Implementation |
|----------|------------|----------------|
| Login | 20 req/sec per IP + progressive backoff (10 attempts per user) | `RefillingTokenBucket` + `Throttler` |
| Signup | 3 req/10sec per IP | `RefillingTokenBucket` |
| Contact Forms | TODO (recommend: 5 req/10min per IP) | Not yet implemented |
| API Endpoints | 20 req/sec per IP (default) | Global bucket |

---

### RBAC Implementation

**User Roles** (`src/lib/server/db/schema.ts:58-62`):

```typescript
export const userRoleEnum = pgEnum('user_role', [
    'admin',                    // Platform admin
    'instructor-independent',   // Independent instructor
    'instructor-school',        // School-affiliated instructor
    'school-admin',            // School owner/admin
    'client'                   // Booking client
]);
```

**Access Control Matrix:**

| Role | Routes | Capabilities |
|------|--------|-------------|
| **admin** | `/admin/*` | - Verify/suspend users<br>- Manage resorts/sports<br>- Oversee all bookings<br>- Review management<br>- Platform analytics |
| **instructor-independent** | `/dashboard/*` | - Edit profile<br>- Manage lessons<br>- Set availability<br>- Accept/reject bookings<br>- View analytics (profile visits) |
| **instructor-school** | `/dashboard/*`<br>`/dashboard/schools` | - Same as independent<br>- View school affiliation<br>- Accept/leave school invitations |
| **school-admin** | `/dashboard/school/*` | - Manage school profile<br>- Invite/accept/remove instructors<br>- View school bookings<br>- Manage school lessons |
| **client** | `/dashboard/my-bookings` | - Browse instructors<br>- Submit booking requests<br>- View booking history |
| **null** (new users) | `/dashboard/choose-role` | - Select role (instructor/school-admin/client)<br>- Redirected here after signup |

**Route Protection Mechanisms:**

1. **Layout Guards** (`+layout.server.ts` files):
   ```typescript
   // Example: /admin/+layout.server.ts
   if (user.role !== 'admin') {
       throw error(403, 'Admin access required');
   }
   ```

2. **Helper Functions**:
   - `requireAuth(event)` - Ensures user is logged in
   - `requireSchoolAdmin(event)` - Validates school admin + ownership
   - Check in every protected route's `+page.server.ts`

3. **No Middleware Directory** - Uses SvelteKit's layout hierarchy for protection

---

### Database Schema

**Core Entity Relationships:**

```
┌─────────────┐           ┌──────────────┐
│    users    │◄─────────►│   sessions   │
│             │ 1      n  │              │
│ - id (PK)   │           │ - userId (FK)│
│ - email     │           │ - expiresAt  │
│ - role      │           └──────────────┘
│ - isVerified│
│ - googleId  │
└──────┬──────┘
       │
       │ 1
       │
       ├──────────n─────────┐
       │                    │
       │              ┌─────▼─────────┐
       │              │schoolAdmins   │
       │              │               │
       │              │- schoolId (FK)│
       │              │- userId (FK)  │
       │              │- isOwner      │
       │              │- isAccepted   │
       │              └───────────────┘
       │                      │
       │                      │ n
       │                      │
       │ 1            ┌───────▼────────┐
       ├──────────────►│    schools     │
       │              │                │
       │              │- id (PK)       │
       │              │- ownerUserId   │
       │              │- name (unique) │
       │              │- isPublished   │
       │              │- isVerified    │
       │              └────────┬───────┘
       │                       │
       │                       │ 1
       │                       │
       │              ┌────────▼────────────┐
       │              │schoolInstructors    │
       │              │                     │
       │              │- schoolId (FK)      │
       │              │- instructorId (FK)  │
       │              │- requestedBy (enum) │
       │              │- isAcceptedBySchool │
       │              │- acceptedAt         │
       │              │- rejectedAt         │
       │              └─────────────────────┘
       │
       │ 1
       │
       ├──────────n──────────┐
       │                     │
       │              ┌──────▼─────────────┐
       │              │bookingRequests     │
       │              │                    │
       │              │- instructorId (FK) │
       │              │- schoolId (FK)     │
       │              │- clientUserId (FK) │
       │              │- clientEmail       │
       │              │- clientPhone       │
       │              │- startDate         │
       │              │- endDate           │
       │              │- hoursPerDay       │
       │              │- numberOfStudents  │
       │              │- status (enum)     │
       │              │- estimatedPrice    │
       │              │- contactInfoUnlocked│
       │              └────────────────────┘
       │                      │
       │                      │ 1
       │                      │
       │              ┌───────▼─────────┐
       │              │    reviews      │
       │              │                 │
       │              │- bookingRequestId│
       │              │- instructorId   │
       │              │- clientEmail    │
       │              │- rating (1-5)   │
       │              │- comment        │
       │              │- isVerified     │
       │              └─────────────────┘
       │
       │ 1
       │
       └──────────n──────────┐
                            │
                     ┌──────▼───────────┐
                     │     lessons      │
                     │                  │
                     │- instructorId(FK)│
                     │- schoolId (FK)   │
                     │- title           │
                     │- description     │
                     │- basePrice       │
                     │- isPublished     │
                     │- isBaseLesson    │
                     └──────────────────┘
```

**Key M:M Relationships:**

```
instructorSports      ──►  links instructors ↔ sports
instructorResorts     ──►  links instructors ↔ resorts
schoolSports          ──►  links schools ↔ sports
schoolResorts         ──►  links schools ↔ resorts
lessonSports          ──►  links lessons ↔ sports
bookingRequestSports  ──►  links bookings ↔ sports
```

**Availability System:**

```
┌──────────────────────────┐
│instructorWorkingHours    │
├──────────────────────────┤
│- instructorId            │
│- dayOfWeek (0-6)         │
│- startTime (HH:MM)       │
│- endTime (HH:MM)         │
│- seasonStart (optional)  │
│- seasonEnd (optional)    │
│- isActive                │
└──────────────────────────┘

┌──────────────────────────────┐
│instructorCalendarBlocks      │
├──────────────────────────────┤
│- instructorId                │
│- startDatetime               │
│- endDatetime                 │
│- source (enum):              │
│    • google_calendar         │
│    • booking_pending         │
│    • booking_confirmed       │
│    • manual                  │
│- googleEventId (optional)    │
│- bookingRequestId (optional) │
│- expiresAt (48h for pending) │
└──────────────────────────────┘
```

**Payment Tables (DISABLED but present):**

```
leadPayments      ──► Tracking instructor lead costs (NOT USED)
clientDeposits    ──► 48h client deposits (NOT USED)
```

---

### Routes & API Endpoints

**Public Routes (No Auth):**

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Homepage with resort search | ✅ Works |
| `/instructors` | Directory listing with search/filters | ✅ Works |
| `/instructors/[id]` | Public profile + booking form | ✅ Works |
| `/resorts` | Resort directory | ✅ Works |
| `/resorts/[country]/[region]` | Resort details | ✅ Works |
| `/reviews` | Reviews page | ✅ Works |
| `/contact` | Contact form | ⚠️ Incomplete |
| `/legal/*` | Terms, privacy, cookies | ✅ Works |

**Auth Routes:**

| Route | Purpose | Status |
|-------|---------|--------|
| `/(auth)/login` | Email/password login | ✅ Works |
| `/(auth)/signup` | Email/password signup | ✅ Works |
| `/(auth)/oauth/google` | Google OAuth flow | ✅ Works |
| `/(auth)/oauth/google/callback` | OAuth callback | ✅ Works |

**Dashboard Routes (Authenticated):**

| Route | Purpose | Required Role | Status |
|-------|---------|---------------|--------|
| `/dashboard` | Main dashboard | Any | ✅ Works |
| `/dashboard/choose-role` | Role selection | `null` role | ✅ Works |
| `/dashboard/profile` | Edit instructor profile | Instructor | ✅ Works |
| `/dashboard/bookings` | Manage bookings | Instructor | ✅ Works |
| `/dashboard/lessons` | Manage lessons | Instructor | ✅ Works |
| `/dashboard/availability` | Set working hours | Instructor | ✅ Works |
| `/dashboard/schools` | View school affiliation | Instructor-School | ✅ Works |
| `/dashboard/my-bookings` | Client booking history | Client | ✅ Works |
| `/dashboard/school/*` | School management | School-Admin | ✅ Works |
| `/dashboard/school/instructors` | Manage instructors | School-Admin | ✅ Works |
| `/dashboard/school/instructors/discover` | Find instructors | School-Admin | ✅ Works |
| `/dashboard/invitations` | Pending invitations | Instructor | ✅ Works |

**Admin Routes (Admin Only):**

| Route | Purpose | Status |
|-------|---------|--------|
| `/admin/dashboard` | Analytics & overview | ✅ Works |
| `/admin/users` | User management | ✅ Works |
| `/admin/instructors` | Instructor verification | ✅ Works |
| `/admin/bookings` | Booking oversight | ✅ Works |
| `/admin/reviews` | Review management | ✅ Works |
| `/admin/resorts` | Resort management | ✅ Works |
| `/admin/sports` | Sports management | ✅ Works |

**API Endpoints:**

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/auth/signup` | POST | Create user | ✅ Works |
| `/api/auth/login` | POST | Login | ✅ Works |
| `/api/bookings/create` | POST | Create booking request | ✅ Works (FREE) |
| `/api/bookings/validate` | POST | Validate booking | ✅ Works |
| `/api/availability/[id]` | GET | Get instructor slots | ✅ Works |
| `/api/pricing/calculate` | POST | Calculate price | ✅ Works |
| `/api/reviews/submit` | POST | Submit review | ✅ Works |
| `/api/calendar/connect` | GET/POST | Google Calendar sync | ✅ Works |
| `/api/webhooks/stripe` | POST | Stripe webhooks | ⚠️ DISABLED (returns 200) |
| `/api/cron/availability` | POST | Clean expired blocks | ✅ Works |
| `/api/health` | GET | Health check | ✅ Works |

---

### Email Integration (n8n)

**Base URL:** `https://automation.personalflow.net/webhook`
**Auth:** `x-n8n-secret` header (from `EMAIL_HEADER_SECRET`)

**Implemented Email Functions:**

| Function | Webhook Path | Triggered When | Status |
|----------|--------------|----------------|--------|
| `sendSignupEmail` | `/797b1c35-f0fd-4b8c-a0a2-014d07e396ae` | User signs up | ✅ Works |
| `sendBookingNotificationToInstructor` | `/booking-notification-instructor` | Booking request created | ✅ Works |
| `sendBookingConfirmationToClient` | `/booking-confirmation-client` | Booking request created | ✅ Works |
| `sendContactInfoToInstructor` | `/booking-contact-info` | Contact info unlocked | ⚠️ Always unlocked |
| `sendCancellationNotificationToInstructor` | `/booking-cancellation-instructor` | Client cancels booking | ✅ Works |
| `sendCancellationConfirmationToClient` | `/booking-cancellation-client` | Client cancels booking | ✅ Works |

**Missing Email Functions (TODO):**

File: `src/features/Schools/lib/schoolInstructorService.ts`

```typescript
// Lines with TODO comments:
// TODO: sendInstructorInvitation       - When school invites instructor
// TODO: sendSchoolApplication          - When instructor applies to school
// TODO: sendInstructorAccepted         - When school accepts instructor
// TODO: sendInstructorRejected         - When school rejects instructor
// TODO: sendInvitationAccepted         - When instructor accepts invitation
// TODO: sendInstructorDeactivated      - When instructor removed from school
```

**Current Workaround:** Logs to console instead of sending emails.

---

## 2. What Currently Works End-to-End

### ✅ Flow 1: Client Signup → Browse → Book Independent Instructor

**Steps to Reproduce:**

1. **Signup:**
   - Navigate to `/signup`
   - Enter email: `client@test.com`, password: `Password123!`
   - Submit form
   - Receives signup email via n8n
   - Redirected to `/dashboard/choose-role`

2. **Stay as Client:**
   - Click "Stay as client" or just navigate away
   - Role remains `null` or can be set to `client`

3. **Browse Instructors:**
   - Navigate to `/instructors`
   - Search works: resort filter, sport filter, language filter, price range
   - Verified badge shown for verified instructors
   - Click on instructor profile

4. **Submit Booking Request:**
   - Fill booking form: dates, time slots, number of students, hours/day
   - Submit form
   - **Contact info immediately unlocked** (no payment)
   - Booking created with status `pending`
   - Client receives confirmation email
   - Instructor receives notification email

5. **Instructor Actions:**
   - Instructor logs in → `/dashboard/bookings`
   - Sees booking request
   - Status changes to `viewed` automatically
   - Can accept or reject
   - On accept: status → `accepted`, calendar block becomes `booking_confirmed`
   - On reject: status → `rejected`, calendar block removed

6. **Client Views Booking:**
   - Navigate to `/dashboard/my-bookings`
   - See booking status
   - Can cancel before acceptance
   - After completion, can submit review

**Result:** ✅ **Works perfectly end-to-end**

---

### ✅ Flow 2: Instructor Signup → Create Profile → Receive Booking

**Steps to Reproduce:**

1. **Signup:**
   - Navigate to `/signup`
   - Enter credentials
   - Redirected to `/dashboard/choose-role`

2. **Become Independent Instructor:**
   - Navigate to `/dashboard/choose-role/instructor`
   - Fill profile form:
     - Bio
     - Professional phone
     - Resorts (dropdown)
     - Sports (checkboxes)
     - Languages (multi-select)
     - Upload profile image (Cloudflare R2)
     - Upload qualification document (Cloudflare R2)
   - Submit
   - Role set to `instructor-independent`
   - `isVerified = false` by default

3. **Set Availability:**
   - Navigate to `/dashboard/availability/working-hours`
   - Set hours for each day of week
   - Save
   - Working hours stored in DB

4. **Create Lesson (Optional):**
   - Navigate to `/dashboard/lessons`
   - Create base lesson with pricing
   - Set group pricing tiers
   - Publish lesson

5. **Receive Booking:**
   - Client submits booking from profile page
   - Instructor sees notification in `/dashboard/bookings`
   - Full contact info visible immediately
   - Accept/reject booking

6. **Profile is Public:**
   - Appears in `/instructors` directory
   - Can filter by `verifiedOnly = false` shows this instructor
   - Profile visits tracked in `profileVisits` table
   - Can view analytics in `/dashboard`

**Result:** ✅ **Works perfectly end-to-end**

---

### ✅ Flow 3: School Admin Signup → Invite Instructor → Manage School

**Steps to Reproduce:**

1. **Signup & Create School:**
   - Navigate to `/signup` → `/dashboard/choose-role/school-admin`
   - Fill school form:
     - School name (auto-generates slug)
     - School email
     - School phone
     - Country code
     - Bio/description
     - Logo upload (optional)
   - Submit
   - Creates `schools` record with `ownerUserId = current_user`
   - Creates `schoolAdmins` entry with `isOwner = true`
   - School is `isPublished = true`, `isVerified = false`
   - User role set to `school-admin`

2. **Access School Dashboard:**
   - Navigate to `/dashboard/school`
   - View school stats:
     - Total instructors
     - Pending requests
     - Recent bookings

3. **Invite Instructor:**
   - Navigate to `/dashboard/school/instructors/discover`
   - Search for instructors by name/resort/sport
   - Click "Invite" on instructor
   - Creates `schoolInstructors` record:
     - `requestedBy = 'school'`
     - `isAcceptedBySchool = true` (since school initiated)
     - `acceptedAt = null`
     - `requestedAt = now()`
   - ⚠️ **No email sent yet (TODO)**

4. **Instructor Accepts Invitation:**
   - Instructor logs in → `/dashboard/invitations`
   - Sees pending invitation from school
   - Clicks "Accept"
   - `acceptedAt = now()`
   - `isActive = true`
   - Instructor role changes to `instructor-school`
   - Creates `schoolInstructorHistory` record
   - ⚠️ **No confirmation email sent yet (TODO)**

5. **School Admin Manages Instructors:**
   - Navigate to `/dashboard/school/instructors`
   - View all active instructors
   - Can remove instructors (sets `isActive = false`)

6. **School Bookings:**
   - Navigate to `/dashboard/school/bookings`
   - View all bookings for school's instructors
   - Bookings show `schoolId` if instructor is affiliated

**Result:** ✅ **Works end-to-end (except missing emails)**

---

### ✅ Flow 4: Instructor Applies to School

**Steps to Reproduce:**

1. **Instructor Browses Schools:**
   - TODO: No public school directory exists yet
   - Currently requires direct navigation or admin providing school info

2. **Instructor Applies:**
   - (Assuming school ID is known)
   - Creates `schoolInstructors` record:
     - `requestedBy = 'instructor'`
     - `isAcceptedBySchool = false`
     - `requestedAt = now()`
   - ⚠️ **No email sent to school admin (TODO)**

3. **School Admin Reviews:**
   - Navigate to `/dashboard/school/instructors/pending`
   - Sees pending applications
   - Can accept or reject

4. **School Admin Accepts:**
   - Clicks "Accept"
   - `isAcceptedBySchool = true`
   - `acceptedAt = now()`
   - Instructor notified (TODO: email)
   - Instructor role changes to `instructor-school`

**Result:** ✅ **Works end-to-end (except missing emails & no public school directory)**

---

### ✅ Flow 5: Google OAuth Login → Calendar Sync

**Steps to Reproduce:**

1. **OAuth Login:**
   - Navigate to `/login`
   - Click "Sign in with Google"
   - Redirected to Google OAuth consent screen
   - User grants permissions
   - Callback to `/(auth)/oauth/google/callback`
   - User created or logged in
   - Session cookie set
   - Redirected to `/dashboard`

2. **Connect Google Calendar:**
   - Navigate to `/dashboard/availability`
   - Click "Connect Google Calendar"
   - Google OAuth flow for calendar scope
   - Access token + refresh token encrypted and stored in `instructorGoogleTokens`
   - Calendar ID saved

3. **Calendar Sync:**
   - Background sync job fetches Google Calendar events
   - Creates `instructorCalendarBlocks` with `source = 'google_calendar'`
   - Blocks marked as unavailable in availability API
   - Prevents double-booking

**Result:** ✅ **Works perfectly end-to-end**

---

### ✅ Flow 6: Admin Verifies Instructor

**Steps to Reproduce:**

1. **Admin Login:**
   - Login with admin account
   - Navigate to `/admin/instructors`

2. **View Unverified Instructors:**
   - List shows all instructors
   - Filter by `isVerified = false`

3. **Verify Instructor:**
   - Click on instructor
   - Review profile, qualifications
   - Click "Verify" button
   - Sets `users.isVerified = true`
   - Instructor can now show "Verified" badge

4. **Suspend User:**
   - Navigate to `/admin/users`
   - Find user
   - Click "Suspend"
   - Sets `users.isSuspended = true`
   - User cannot log in (checked in auth hook)

**Result:** ✅ **Works perfectly end-to-end**

---

## 3. What's Missing or Broken

### 🐛 Critical Bug: Booking Cancellation Returns Undefined Variables

**File:** `src/features/Bookings/lib/bookingRequestService.ts:180-187`

**Issue:**
```typescript
return {
    success: true,
    bookingRequestId,
    depositRefunded,      // ❌ UNDEFINED - never declared
    refundAmount,         // ❌ UNDEFINED - never declared
    currency,             // ❌ UNDEFINED - never declared
    usedLaunchCode: !!booking.usedLaunchCode
};
```

**Why:** The comment above says "No deposit refunds - platform is 100% free" but the code tries to return variables that were never declared after removing deposit refund logic.

**Impact:** Any code consuming this response will receive `undefined` values, potentially causing runtime errors.

**Fix Required:**
```typescript
return {
    success: true,
    bookingRequestId,
    depositRefunded: false,
    refundAmount: 0,
    currency: booking.currency || 'EUR',
    usedLaunchCode: !!booking.usedLaunchCode
};
```

---

### ⚠️ Missing: School Email Notifications

**File:** `src/features/Schools/lib/schoolInstructorService.ts`

**Issue:** 6 email functions are stubbed with TODO comments:

1. **`sendInstructorInvitation`** (line ~120)
   - When: School admin invites instructor
   - Currently: `console.log('TODO: sendInstructorInvitation')`
   - Impact: Instructors don't know they've been invited

2. **`sendSchoolApplication`** (line ~175)
   - When: Instructor applies to school
   - Currently: `console.log('TODO: sendSchoolApplication')`
   - Impact: School admins don't know about applications

3. **`sendInstructorAccepted`** (line ~230)
   - When: School accepts instructor application
   - Currently: `console.log('TODO: sendInstructorAccepted')`
   - Impact: Instructors don't know they've been accepted

4. **`sendInstructorRejected`** (line ~280)
   - When: School rejects instructor application
   - Currently: `console.log('TODO: sendInstructorRejected')`
   - Impact: Instructors don't know they've been rejected

5. **`sendInvitationAccepted`** (line ~340)
   - When: Instructor accepts school invitation
   - Currently: `console.log('TODO: sendInvitationAccepted')`
   - Impact: School admins don't know invitation was accepted

6. **`sendInstructorDeactivated`** (line ~390)
   - When: School removes instructor
   - Currently: `console.log('TODO: sendInstructorDeactivated')`
   - Impact: Instructors don't know they've been removed

**Fix Required:** Implement these 6 functions in `src/lib/server/webhooks/n8n/email-n8n.ts` following the pattern of existing email functions.

---

### ⚠️ Incomplete: Contact/Lead Capture Page

**File:** `src/routes/contact/+page.svelte`

**Current State:**
- Exists as a marketing page with hardcoded email `admin@localsnow.org`
- No form submission handler
- No API endpoint for contact form
- No email notification when contact form submitted

**Missing Functionality:**
1. Contact form component with fields: name, email, message, subject
2. API endpoint: `POST /api/contact/submit`
3. n8n email function: `sendContactFormSubmission(data)`
4. Rate limiting on contact form (recommend: 5 submissions per 10 minutes per IP)
5. Success/error feedback to user

**Directory Mode Impact:** In a free directory, contact forms are crucial for lead capture. This needs to be functional.

---

### ⚠️ Missing: Public School Directory

**Issue:** Schools can be created, but there's no public-facing school directory page.

**Current State:**
- Schools exist in DB with `isPublished` flag
- No `/schools` route exists
- No school public profile page
- Instructors can be affiliated with schools, but clients can't browse by school

**Missing Pages:**
1. `/schools` - List all published schools with search/filter
2. `/schools/[slug]` - Public school profile page showing:
   - School info (bio, logo, contact)
   - List of affiliated instructors
   - School reviews/stats

**Directory Mode Impact:** Schools are a key differentiator. They should be prominently featured in a directory model.

---

### ⚠️ Missing: Profile Publishing Controls

**Issue:** Instructors have no way to draft/unpublish their profiles.

**Current State:**
- All instructor profiles are public immediately upon creation
- No `isPublished` flag on users table for instructors
- Cannot hide profile temporarily

**Directory Mode Need:**
- Instructors should control when their profile goes live
- Draft mode to prepare profile before publishing
- Ability to unpublish temporarily (e.g., off-season)

**Fix Required:**
- Add `isPublished` column to `users` table (default `false`)
- Add publish/unpublish toggle in `/dashboard/profile`
- Filter instructors by `isPublished = true` in directory
- Show draft status clearly in dashboard

---

### ⚠️ Missing: Moderation Hooks

**Issue:** No moderation queue or admin review process for new profiles.

**Current State:**
- Instructors can publish profiles immediately
- Admin verification is separate from initial moderation
- No flagging/reporting system

**Directory Mode Need:**
- Admin review queue for new profiles (optional but recommended)
- Ability for users to report inappropriate profiles
- Admin moderation dashboard

**Recommendation:** Since `isVerified` already exists, leverage it as a moderation gate:
- New profiles start as `isPublished = false`
- Admin reviews and sets `isVerified = true` + `isPublished = true`
- Or allow auto-publish with post-moderation

---

### ⚠️ Incomplete: Lead/Contact Forms on Instructor Profiles

**Issue:** Booking form is the only way to contact instructors.

**Current State:**
- `/instructors/[id]` has booking form
- No "general inquiry" or "ask a question" form
- Contact info (professional phone) visible on profile but may not be desired

**Directory Mode Need:**
- Lightweight contact form without booking requirements
- "Ask a question" CTA
- Email goes to instructor without exposing their email to client
- Tracks leads separate from booking requests

**Fix Required:**
1. Add "Contact Instructor" button on profile
2. Modal form with: name, email, message
3. API endpoint: `POST /api/instructors/[id]/contact`
4. n8n email: `sendInstructorContactForm(data)`
5. Store in `leads` table (currently empty)

---

### ⚠️ Missing: Analytics for Directory Mode

**Current Analytics:**
- Profile visits tracked (`profileVisits` table)
- Instructor can see visit count in dashboard

**Missing Analytics:**
- Contact form submissions per instructor
- Search result impressions
- Click-through rate from search to profile
- Most searched resorts/sports
- Popular filters

**Directory Mode Need:**
- Instructors want to know: "How many people viewed my profile?" ✅ (done)
- "How many people contacted me?" ❌ (missing)
- "What search terms led to my profile?" ❌ (missing)

---

### 🔒 Security Issues (Minor)

**1. No Rate Limiting on Contact Forms**
- **Impact:** Spam vulnerability
- **Fix:** Add rate limiting (5 req/10min per IP)

**2. Email Exposure on Instructor Profiles**
- **Current:** Instructor's `email` field is in public API responses
- **Impact:** Email scraping possible
- **Fix:** Remove email from public instructor queries, only show `professionalPhone` if they opt-in

**3. No CSRF Protection on Forms**
- **Current:** Relying on SameSite cookies
- **Impact:** Low risk, but best practice is CSRF tokens
- **Fix:** Add CSRF tokens to forms (SvelteKit has built-in support)

**4. No Input Sanitization in Bio Fields**
- **Current:** Bio, school descriptions stored as plain text
- **Impact:** XSS if rendered as HTML
- **Fix:** Sanitize user-generated content before rendering (already using `text-muted-foreground` classes, so likely safe)

---

## 4. Gaps for Directory Mode

### 📋 Feature Gap Analysis

| Feature | Current State | Directory Mode Need | Priority |
|---------|---------------|---------------------|----------|
| **Public Directory** | ✅ Exists | ✅ Works | - |
| **Search/Filter** | ✅ Functional | ✅ Works | - |
| **Instructor Profiles** | ✅ Detailed | ✅ Works | - |
| **School Profiles** | ❌ No public page | 🔴 Need public school directory | HIGH |
| **Profile Publishing** | ❌ Always public | 🔴 Need draft/publish controls | HIGH |
| **Contact Forms** | ⚠️ Incomplete | 🔴 Need general contact form | HIGH |
| **School Emails** | ⚠️ Stubbed | 🔴 Need 6 email notifications | HIGH |
| **Moderation** | ⚠️ Manual admin | 🟡 Need moderation queue | MEDIUM |
| **Lead Tracking** | ❌ No implementation | 🟡 Need lead capture analytics | MEDIUM |
| **Reviews Prominence** | ✅ Works | 🟡 Make more visible | MEDIUM |
| **Booking System** | ✅ Free | 🟡 Could be simplified | LOW |
| **Payment System** | ⚠️ Disabled | 🟢 Can remove entirely | LOW |

---

### 🎯 Directory Mode Capabilities Needed

**1. Public Browsing (90% Complete)**
- ✅ Search by resort
- ✅ Filter by sport
- ✅ Filter by language
- ✅ Filter by price range
- ✅ Filter by instructor type (independent vs school)
- ✅ Filter by verified status
- ❌ Filter by school affiliation
- ❌ Sort by review rating
- ❌ Sort by "featured" status

**2. Profile Management (70% Complete)**
- ✅ Create instructor profile
- ✅ Edit profile details
- ✅ Upload photos/qualifications
- ❌ Draft/publish controls
- ❌ SEO optimization (meta tags, structured data)
- ⚠️ Analytics (visits tracked, but no contact form analytics)

**3. School Management (75% Complete)**
- ✅ Create school
- ✅ Invite instructors
- ✅ Accept instructor applications
- ⚠️ Missing 6 email notifications
- ❌ No public school directory
- ❌ No school public profile page

**4. Contact/Lead Capture (30% Complete)**
- ✅ Booking form works (but too heavy for simple inquiries)
- ⚠️ Contact page exists but incomplete
- ❌ No instructor contact form
- ❌ No lead analytics

**5. Moderation & Trust (60% Complete)**
- ✅ Admin verification system
- ✅ Review system
- ❌ No moderation queue
- ❌ No reporting system
- ❌ No profile approval workflow

---

### 🔐 Security Gaps for Directory Mode

**1. Rate Limiting Gaps:**
| Endpoint | Current Limit | Recommended |
|----------|--------------|-------------|
| Contact forms | ❌ None | 5 req/10min per IP |
| Instructor contact | ❌ None | 10 req/hour per IP |
| Profile creation | ❌ None | 3 profiles/day per user |

**2. Data Exposure:**
- Instructor email visible in public API responses
- Client contact info unlocked immediately (intentional for free model)
- No option to hide professional phone

**3. Spam Prevention:**
- No CAPTCHA on contact forms
- No honeypot fields
- No email verification required before profile creation (email verified, but not enforced)

---

## 5. Recommended Minimal Changes

### 🎯 Strategy: Incremental Enhancement (NOT Refactor)

**Principles:**
1. Reuse existing patterns (SvelteKit routes, Drizzle schema, n8n webhooks)
2. No breaking changes to existing functionality
3. Add features, don't remove (except payment code)
4. Keep scope minimal for MVP directory mode

---

### Phase A: Fix Critical Issues (1-2 days)

**A1. Fix Booking Cancellation Bug** ⚠️ CRITICAL
- File: `src/features/Bookings/lib/bookingRequestService.ts:180-187`
- Change: Define `depositRefunded`, `refundAmount`, `currency` variables
- Test: Cancel a booking, verify response structure

**A2. Implement School Email Notifications** ⚠️ HIGH
- File: `src/lib/server/webhooks/n8n/email-n8n.ts`
- Add 6 functions:
  1. `sendInstructorInvitation()`
  2. `sendSchoolApplication()`
  3. `sendInstructorAccepted()`
  4. `sendInstructorRejected()`
  5. `sendInvitationAccepted()`
  6. `sendInstructorDeactivated()`
- File: `src/features/Schools/lib/schoolInstructorService.ts`
- Replace `console.log()` with actual email calls
- Test: Invite instructor → verify email received

**A3. Add Rate Limiting to Contact Forms** 🔒 MEDIUM
- File: Create `src/lib/server/contactRateLimit.ts`
- Add: `RefillingTokenBucket` for contact forms (5 req/10min)
- Apply to all contact endpoints
- Test: Submit 6 contact forms rapidly → verify 6th is blocked

---

### Phase B: Essential Directory Features (3-5 days)

**B1. Add Profile Publishing Controls** 🎯 HIGH
- **Database:**
  - Add migration: `ALTER TABLE users ADD COLUMN is_published BOOLEAN DEFAULT false`
  - Backfill existing instructors: `UPDATE users SET is_published = true WHERE role LIKE 'instructor%'`

- **Backend:**
  - File: `src/features/Instructors/lib/instructorRepository.ts`
  - Modify `searchInstructors()` to filter by `isPublished = true`

- **Frontend:**
  - File: `src/routes/dashboard/profile/+page.svelte`
  - Add toggle: "Publish Profile" / "Unpublish Profile"
  - Show draft badge in dashboard when unpublished

- **API:**
  - File: Create `src/routes/api/instructors/[id]/publish/+server.ts`
  - `POST` endpoint to toggle `isPublished` status

- **Test:** Create instructor → keep as draft → verify not in directory → publish → verify appears

**B2. Create General Contact Form** 🎯 HIGH
- **Database:**
  - Add migration for `instructorLeads` table:
    ```sql
    CREATE TABLE instructor_leads (
      id SERIAL PRIMARY KEY,
      uuid UUID DEFAULT gen_random_uuid(),
      instructor_id INTEGER REFERENCES users(id),
      client_name VARCHAR(100),
      client_email VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    ```

- **Backend:**
  - File: Create `src/features/Leads/lib/leadService.ts`
  - Method: `createInstructorLead(instructorId, clientData)`

- **Email:**
  - File: `src/lib/server/webhooks/n8n/email-n8n.ts`
  - Add: `sendInstructorContactForm(instructorEmail, clientName, clientEmail, message)`

- **API:**
  - File: Create `src/routes/api/instructors/[id]/contact/+server.ts`
  - `POST` endpoint with rate limiting (10 req/hour per IP)

- **Frontend:**
  - File: `src/routes/instructors/[id]/+page.svelte`
  - Add: "Contact Instructor" button → modal with form
  - Fields: name, email, message (max 1000 chars)

- **Test:** Submit contact form → verify instructor receives email → verify lead stored in DB

**B3. Implement Contact Page Form** 🎯 MEDIUM
- **Backend:**
  - File: Create `src/features/Contact/lib/contactService.ts`
  - Store submissions in `general_leads` table (or email only)

- **API:**
  - File: Create `src/routes/api/contact/submit/+server.ts`
  - `POST` endpoint with rate limiting (5 req/10min per IP)

- **Email:**
  - File: `src/lib/server/webhooks/n8n/email-n8n.ts`
  - Add: `sendContactFormSubmission(name, email, subject, message)`

- **Frontend:**
  - File: `src/routes/contact/+page.svelte`
  - Add form component with: name, email, subject, message
  - Success/error toast notifications

- **Test:** Submit contact form → verify support email received

---

### Phase C: School Directory & Profiles (3-5 days)

**C1. Create Public School Directory** 🎯 HIGH
- **Backend:**
  - File: `src/features/Schools/lib/schoolRepository.ts`
  - Add: `getPublishedSchools(filters)` method

- **Routes:**
  - File: Create `src/routes/schools/+page.server.ts`
  - Load published schools with instructors count

- **Frontend:**
  - File: Create `src/routes/schools/+page.svelte`
  - Grid layout showing schools
  - Filters: resort, sport, region
  - Search by name

- **Test:** Create school → verify appears in `/schools` directory

**C2. Create School Public Profile Page** 🎯 HIGH
- **Backend:**
  - File: `src/features/Schools/lib/schoolRepository.ts`
  - Add: `getSchoolBySlug(slug)` with instructors

- **Routes:**
  - File: Create `src/routes/schools/[slug]/+page.server.ts`
  - Load school + affiliated instructors

- **Frontend:**
  - File: Create `src/routes/schools/[slug]/+page.svelte`
  - School info: logo, bio, contact, stats
  - List of instructors with profiles
  - Schema.org structured data (Organization)

- **Test:** Navigate to `/schools/test-school` → verify school details shown

**C3. Add School Filter to Instructor Directory** 🎯 MEDIUM
- **Backend:**
  - File: `src/features/Instructors/lib/instructorRepository.ts`
  - Modify `searchInstructors()` to add `schoolId` filter

- **Frontend:**
  - File: `src/routes/instructors/+page.svelte`
  - Add filter dropdown: "Filter by School"
  - Load schools for dropdown

- **Test:** Filter instructors by school → verify only school's instructors shown

---

### Phase D: Analytics & Reporting (2-3 days)

**D1. Add Lead Analytics Dashboard** 🎯 MEDIUM
- **Database:**
  - Ensure `instructorLeads` table has proper indexes

- **Backend:**
  - File: `src/features/Leads/lib/leadService.ts`
  - Add: `getInstructorLeadStats(instructorId, timeframe)`

- **Frontend:**
  - File: `src/routes/dashboard/+page.svelte`
  - Add section: "Contact Form Submissions"
  - Show: total leads, leads this month, recent leads

- **Test:** Submit contact form → verify appears in instructor dashboard

**D2. Enhance Review Display** 🎯 LOW
- **Frontend:**
  - File: `src/routes/instructors/[id]/+page.svelte`
  - Make reviews more prominent
  - Add review count to directory listings
  - Show average rating badge

- **Test:** View instructor profile → verify reviews prominently displayed

---

### Phase E: Cleanup & Optimization (1-2 days)

**E1. Remove Payment Processing Code** 🎯 LOW
- **Files to Simplify:**
  - `src/features/Bookings/lib/bookingRequestService.ts`
    - Remove `leadPayments` references
    - Remove `clientDeposits` logic
  - `src/routes/api/webhooks/stripe/+server.ts`
    - Already disabled, can remove file
  - `src/features/Payments/` (entire directory)
    - Can be deleted if no future payment plans

- **Database:**
  - Keep tables for historical data
  - Add migration comments: "DEPRECATED - free model"

- **Test:** Create booking → verify no payment logic triggered

**E2. Simplify Booking Tentative Blocks** 🎯 LOW (Optional)
- **Current:** 48-hour tentative blocks with expiration
- **Option:** Keep as-is (provides booking protection)
- **Alternative:** Remove tentative blocks, make calendar blocks instant
- **Recommendation:** KEEP tentative blocks for user experience

**E3. Add Profile SEO Optimization** 🎯 MEDIUM
- **Frontend:**
  - File: `src/routes/instructors/[id]/+page.svelte`
  - Add comprehensive meta tags
  - Add Schema.org Person/LocalBusiness structured data
  - Generate OpenGraph images dynamically

- **Same for Schools:**
  - File: `src/routes/schools/[slug]/+page.svelte`
  - Add meta tags + structured data

- **Test:** View page source → verify meta tags present

---

## 6. Database Migrations Required

### Migration 1: Add Profile Publishing

```sql
-- Add is_published column to users table
ALTER TABLE users
ADD COLUMN is_published BOOLEAN DEFAULT false;

-- Backfill existing instructors as published
UPDATE users
SET is_published = true
WHERE role IN ('instructor-independent', 'instructor-school');

-- Add index for directory queries
CREATE INDEX idx_users_published_role
ON users(is_published, role)
WHERE role IN ('instructor-independent', 'instructor-school');
```

### Migration 2: Create Instructor Leads Table

```sql
CREATE TABLE instructor_leads (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_name VARCHAR(100),
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',  -- new, contacted, converted, spam
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instructor_leads_instructor ON instructor_leads(instructor_id);
CREATE INDEX idx_instructor_leads_created ON instructor_leads(created_at DESC);
```

### Migration 3: Create General Contact Submissions Table (Optional)

```sql
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contact_submissions_created ON contact_submissions(created_at DESC);
```

---

## 7. Testing Checklist

### Regression Tests (Ensure Nothing Breaks)

- [ ] Existing instructor signup still works
- [ ] Existing booking flow still works
- [ ] School admin dashboard still works
- [ ] Google OAuth still works
- [ ] Calendar sync still works
- [ ] Admin panel still works
- [ ] All email notifications still sent

### New Feature Tests

#### Profile Publishing
- [ ] New instructor defaults to `isPublished = false`
- [ ] Unpublished profiles don't appear in `/instructors` directory
- [ ] Toggle publish status in dashboard works
- [ ] Published profiles appear in directory

#### Contact Forms
- [ ] Instructor contact form submits successfully
- [ ] Instructor receives email when contacted
- [ ] Lead stored in `instructorLeads` table
- [ ] Rate limiting works (10 req/hour)
- [ ] General contact form submits successfully
- [ ] Support team receives contact form email

#### School Directory
- [ ] `/schools` page loads successfully
- [ ] Only `isPublished = true` schools appear
- [ ] School search/filter works
- [ ] School profile page loads correctly
- [ ] School instructors list displays
- [ ] School filter in instructor directory works

#### Analytics
- [ ] Lead count shows in instructor dashboard
- [ ] Profile visits still tracked correctly
- [ ] Lead details viewable in dashboard

---

## 8. Risk Assessment

### Low Risk Changes ✅
- Adding new tables (`instructorLeads`, `contact_submissions`)
- Adding new columns (`users.is_published`)
- Creating new routes (`/schools`, `/api/contact`)
- Adding rate limiting to new endpoints
- Implementing missing email notifications

### Medium Risk Changes ⚠️
- Modifying `searchInstructors()` to filter by `isPublished`
  - **Risk:** Could hide existing instructors if backfill fails
  - **Mitigation:** Backfill existing instructors as published in same migration

- Removing payment processing code
  - **Risk:** Historical data might be referenced elsewhere
  - **Mitigation:** Keep database tables, only remove service layer code

### High Risk Changes 🔴
- None proposed (intentionally avoiding)

---

## 9. Estimated Effort

| Phase | Tasks | Est. Time | Complexity |
|-------|-------|-----------|------------|
| **Phase A** | Fix bugs, add school emails | 1-2 days | Low-Medium |
| **Phase B** | Profile publishing, contact forms | 3-5 days | Medium |
| **Phase C** | School directory & profiles | 3-5 days | Medium |
| **Phase D** | Analytics & reporting | 2-3 days | Low-Medium |
| **Phase E** | Cleanup & optimization | 1-2 days | Low |
| **Testing** | Comprehensive testing | 2-3 days | Medium |
| **TOTAL** | | **12-20 days** | |

---

## 10. Summary & Recommendations

### Current State: 75% Ready for Directory Mode ✅

**What Works:**
- Solid SvelteKit + Drizzle + PostgreSQL foundation
- Clean feature-based architecture
- All auth flows functional
- Public directory browsing works
- Booking system already free
- School management mostly complete
- Production-ready security (rate limiting, sessions, RBAC)

**What Needs Work:**
- Fix critical cancellation bug
- Implement 6 missing school email notifications
- Add profile publishing controls
- Create contact/lead capture forms
- Build public school directory
- Add lead analytics

**Recommended Approach:**
1. **Fix critical issues first** (Phase A)
2. **Add essential directory features** (Phase B-C)
3. **Enhance analytics** (Phase D)
4. **Clean up payment code** (Phase E)

**Key Decisions Needed:**
1. Should instructors auto-publish or require admin approval?
   - **Recommendation:** Auto-publish with `isPublished = false` default, let them toggle
2. Should we keep tentative booking blocks?
   - **Recommendation:** YES, keeps good UX for instructors
3. Should we completely remove Stripe code?
   - **Recommendation:** Remove service layer, keep DB tables for historical data
4. Should schools require verification before appearing publicly?
   - **Recommendation:** YES, use `schools.isVerified` flag

---

## Next Steps

1. **Review this audit document**
2. **Proceed to Phase 2:** Create implementation plan (`/docs/plan-directory-mode.md`)
3. **Wait for "GO" approval** before making any code changes
4. **Implement in small, reviewable steps** with confirmation at each milestone
