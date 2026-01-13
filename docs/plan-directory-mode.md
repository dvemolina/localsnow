# LocalSnow Directory Mode Implementation Plan

**Date:** 2026-01-13
**Branch:** `claude/pivot-free-directory-A6PR4`
**Status:** Phase 2 - Implementation Plan (NO CODE CHANGES YET)

---

## Table of Contents

1. [Directory Mode Specification](#1-directory-mode-specification)
2. [Implementation Options](#2-implementation-options)
3. [Recommended Execution Plan](#3-recommended-execution-plan)
4. [Testing & Verification Plan](#4-testing--verification-plan)
5. [Rollback Strategy](#5-rollback-strategy)

---

## 1. Directory Mode Specification

### 1.1 Core Concept

**LocalSnow Directory Mode** transforms the platform from a booking marketplace into a **free discovery directory** where:

- Instructors and schools create **public profiles** to be discovered
- Clients browse, search, and **contact directly** (no payment layer)
- Platform facilitates connection, not transactions
- Revenue model shifts from commission to (future) premium listings, ads, or freemium features

---

### 1.2 Role Capability Matrix

| Capability | Client | Instructor (Independent) | Instructor (School) | School Admin | Platform Admin |
|------------|--------|--------------------------|---------------------|--------------|----------------|
| **Browse directory** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Search/filter instructors** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View instructor profiles** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View school profiles** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Contact instructor (form)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Submit booking request** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create instructor profile** | ❌ | ✅ (edit own) | ✅ (edit own) | ❌ | ✅ (any) |
| **Publish/unpublish profile** | ❌ | ✅ (own) | ✅ (own) | ❌ | ✅ (any) |
| **Create school** | ❌ | ❌ | ❌ | ✅ (edit own) | ✅ (any) |
| **Invite instructors to school** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Accept school invitation** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Apply to school** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Accept instructor applications** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Manage school instructors** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **View lead analytics** | ❌ | ✅ (own) | ✅ (own) | ✅ (school) | ✅ (all) |
| **Verify profiles** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Moderate content** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage resorts/sports** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### 1.3 Key User Flows

#### Flow 1: Instructor Creates & Publishes Profile

```
1. Signup → Email verification → Choose role "Instructor"
2. Fill profile form:
   - Personal info (name, bio, languages)
   - Professional contact (phone, email preference)
   - Resorts & sports
   - Upload profile image
   - Upload qualification documents
3. Profile saved as DRAFT (isPublished = false)
4. Instructor reviews profile
5. Click "Publish Profile" → Profile goes live
6. Appears in public directory at /instructors
7. [Optional] Admin verifies → Badge shown
```

**Success Criteria:**
- Profile not visible until published
- Clear "Draft" vs "Published" status in dashboard
- One-click publish/unpublish toggle

---

#### Flow 2: Client Discovers & Contacts Instructor

```
1. Visit /instructors (no auth required)
2. Search by:
   - Resort (dropdown)
   - Sport (checkboxes)
   - Language (multi-select)
   - Price range (slider)
   - Verified only (toggle)
   - School affiliation (dropdown)
3. Results show:
   - Profile image
   - Name
   - Bio snippet (50 chars)
   - Verified badge
   - Sports icons
   - Average rating
   - School logo (if affiliated)
4. Click profile → View full profile
5. Options to contact:
   a) "Request Booking" (existing flow) → includes dates/times
   b) "Send Quick Message" (NEW) → simple contact form
6. Fill contact form:
   - Name
   - Email
   - Message (max 1000 chars)
7. Submit → Instructor receives email immediately
8. Lead stored in instructorLeads table
9. Success message: "Your message has been sent!"
```

**Success Criteria:**
- Contact form accessible without account
- Rate limit prevents spam (10 messages/hour per IP)
- Instructor gets email with reply-to address
- Lead appears in instructor's dashboard

---

#### Flow 3: School Creates Profile & Invites Instructors

```
1. Signup → Choose role "School Admin"
2. Fill school form:
   - School name
   - Email & phone
   - Bio/description
   - Logo upload
   - Resorts & sports
3. School created as PUBLISHED but UNVERIFIED
4. Access /dashboard/school
5. Navigate to "Manage Instructors" → "Discover"
6. Search for instructors by name/resort/sport
7. Click "Invite" → Creates pending invitation
8. [NEW] Instructor receives email notification
9. Instructor logs in → /dashboard/invitations
10. Accepts invitation → [NEW] School admin receives confirmation email
11. Instructor's profile now shows school affiliation
12. Instructor appears in school's public profile
```

**Success Criteria:**
- All 6 email notifications sent correctly
- School profile visible at /schools/[slug]
- School's instructors listed on school profile
- Clear indication of school affiliation on instructor profiles

---

#### Flow 4: Client Discovers School & Contacts Instructors

```
1. Visit /schools (NEW - no auth required)
2. Browse schools by:
   - Region
   - Resort
   - Sport
3. Click school → View /schools/[slug]
4. School profile shows:
   - Logo, bio, contact info
   - List of affiliated instructors
   - Stats (instructor count, total reviews)
5. Click instructor from school page
6. Contact instructor via form
```

**Success Criteria:**
- School directory publicly accessible
- School profile page with instructor list
- Clear branding and differentiation from independent instructors

---

#### Flow 5: Instructor Views Lead Analytics

```
1. Instructor logs in → /dashboard
2. Dashboard shows:
   - Profile visits (existing)
   - Contact form submissions (NEW)
   - Booking requests (existing)
3. Metrics:
   - Total leads this month
   - Lead sources (contact form vs booking form)
   - Recent leads list
4. Click lead → View details:
   - Client name, email, phone
   - Message content
   - Timestamp
   - Status (new, contacted, converted)
5. Instructor can mark lead as "Contacted" or "Converted"
```

**Success Criteria:**
- Lead count accurate and real-time
- Lead details accessible
- Status tracking works

---

### 1.4 Content Moderation Strategy

**Option A: Post-Moderation (Recommended for MVP)**
- Instructors publish profiles immediately (`isPublished = true`)
- Admin reviews profiles periodically
- Admin can unpublish or suspend if policy violated
- Verification badge (`isVerified = true`) given after manual review

**Option B: Pre-Moderation**
- Instructors submit profiles (`isPublished = false`)
- Admin reviews and approves (`isPublished = true`)
- Higher quality but slower onboarding

**Recommendation:** Start with **Option A** (post-moderation) for faster time-to-market. Current `isVerified` flag serves as quality signal without blocking profiles.

---

### 1.5 Data Privacy & Security

**Profile Visibility Controls:**
- Instructors can publish/unpublish anytime
- Professional phone shown only if provided
- Email address **never** shown publicly (use contact form)
- Client contact info only visible to instructor after booking/contact

**Rate Limiting (Enhanced):**

| Endpoint | Limit | Bucket Type |
|----------|-------|-------------|
| `POST /api/auth/signup` | 3 req / 10 sec per IP | Existing ✅ |
| `POST /api/auth/login` | 20 req/sec per IP + 10 attempts per user | Existing ✅ |
| `POST /api/instructors/[id]/contact` | 10 req / hour per IP | NEW 🔴 |
| `POST /api/contact/submit` | 5 req / 10 min per IP | NEW 🔴 |
| `POST /api/bookings/create` | 10 req / hour per IP | NEW 🔴 |

**RBAC Enforcement:**
- All existing role checks remain
- New routes protected with `requireAuth()` where appropriate
- Public routes (directory, profiles) remain open

---

## 2. Implementation Options

### Option 1: Minimal MVP (Recommended) ⭐

**Scope:** Fix critical bugs + essential directory features only

**Includes:**
- ✅ Fix booking cancellation bug
- ✅ Implement 6 missing school email notifications
- ✅ Add profile publishing controls (`isPublished` column)
- ✅ Create instructor contact form + API + email
- ✅ Add rate limiting to contact forms
- ✅ Create public school directory (`/schools`)
- ✅ Create school profile page (`/schools/[slug]`)
- ✅ Add basic lead analytics to instructor dashboard

**Excludes:**
- ❌ General contact page form (keep as mailto link)
- ❌ Advanced lead management (status tracking, notes)
- ❌ Profile SEO optimization (structured data)
- ❌ Payment code removal (keep for future if needed)
- ❌ Advanced search filters (sort by rating, featured)

**Effort:** 10-14 days
**Risk:** Low
**Value:** High (gets directory mode functional)

**Pros:**
- Fast to implement
- Low risk of breaking existing features
- Delivers core directory functionality
- Can iterate based on user feedback

**Cons:**
- Some "nice to have" features missing
- Payment code remains (clutters codebase)
- SEO not optimized

---

### Option 2: Complete Directory Mode

**Scope:** Everything in Option 1 + enhancements

**Additional Includes:**
- ✅ Implement general contact page form
- ✅ Advanced lead management (CRM-lite)
- ✅ Profile SEO optimization (meta tags, structured data)
- ✅ Remove all payment processing code
- ✅ Add advanced search (sort by rating, reviews, featured)
- ✅ Add profile moderation queue
- ✅ Add reporting/flagging system
- ✅ Enhanced analytics (search impressions, CTR)

**Effort:** 18-25 days
**Risk:** Medium
**Value:** High (full-featured directory)

**Pros:**
- Complete directory experience
- Clean codebase (no payment legacy)
- Better SEO
- More robust moderation

**Cons:**
- Longer development time
- Higher risk of introducing bugs
- May be over-engineered for initial launch

---

### Option 3: Quick Fix Only (Not Recommended)

**Scope:** Fix critical bugs only, no new features

**Includes:**
- ✅ Fix booking cancellation bug
- ✅ Implement 6 missing school email notifications
- ✅ Add rate limiting to existing contact forms

**Excludes:**
- Everything else

**Effort:** 2-3 days
**Risk:** Very Low
**Value:** Low (doesn't achieve directory mode goals)

**Pros:**
- Very fast
- Minimal risk

**Cons:**
- Doesn't achieve directory mode transformation
- Still has major feature gaps
- Requires another round of development soon

---

### Recommended Choice: **Option 1 - Minimal MVP** ⭐

**Rationale:**
1. **Delivers core value** (public directory + contact forms)
2. **Low risk** (incremental changes)
3. **Fast time-to-market** (~2 weeks)
4. **Allows iteration** based on real user feedback
5. **Preserves existing functionality** (booking system still works)
6. **Fits "incremental" requirement** from brief

We can always add Option 2 features in a second phase after validating directory mode with users.

---

## 3. Recommended Execution Plan

### Implementation Strategy

**Principles:**
- Small, focused commits
- One PR per step
- Test after each step
- Stop for confirmation after each step
- No breaking changes
- Reuse existing patterns

**Branch Strategy:**
- Work on: `claude/pivot-free-directory-A6PR4`
- Push after each completed step
- Create PR to `main` only after all steps complete

---

### Step-by-Step Execution (Option 1 - Minimal MVP)

---

#### **STEP 1: Fix Critical Booking Cancellation Bug** 🐛

**Files Changed:**
- `src/features/Bookings/lib/bookingRequestService.ts` (1 file)

**Changes:**
```typescript
// Line 180-187
return {
    success: true,
    bookingRequestId,
    depositRefunded: false,              // ADD
    refundAmount: 0,                     // ADD
    currency: booking.currency || 'EUR', // ADD
    usedLaunchCode: !!booking.usedLaunchCode
};
```

**Testing:**
```bash
# Manual test:
1. Create booking request
2. Cancel booking from client dashboard
3. Verify response includes all fields
4. Check no undefined errors in console
```

**Verification:**
- ✅ Cancellation completes without errors
- ✅ Response has all expected fields
- ✅ Email notifications still sent

**Stop for confirmation** ✋

---

#### **STEP 2: Add Profile Publishing Controls - Database Migration** 🗄️

**Files Changed:**
- `drizzle/migrations/0027_add_profile_publishing.sql` (1 new file)
- `src/lib/server/db/schema.ts` (1 file - add column definition)

**Migration:**
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

**Schema Update:**
```typescript
// src/lib/server/db/schema.ts
export const users = pgTable('users', {
    // ... existing columns ...
    isPublished: boolean('is_published').default(false),
});
```

**Testing:**
```bash
# Run migration
npm run db:push
# or
npm run db:migrate

# Verify in psql:
psql $DATABASE_URL -c "SELECT id, name, role, is_published FROM users WHERE role LIKE 'instructor%' LIMIT 5;"
```

**Verification:**
- ✅ Column added successfully
- ✅ Existing instructors have `is_published = true`
- ✅ Index created
- ✅ No errors in migration

**Stop for confirmation** ✋

---

#### **STEP 3: Update Instructor Repository to Filter by isPublished** 🔍

**Files Changed:**
- `src/features/Instructors/lib/instructorRepository.ts` (1 file)

**Changes:**
```typescript
// In searchInstructors() method, add to conditions array:
conditions.push(eq(users.isPublished, true));
```

**Testing:**
```bash
# Manual test:
1. Visit /instructors
2. Verify published instructors appear
3. Manually set an instructor to is_published = false in DB
4. Verify they disappear from directory
5. Reset to true, verify they reappear
```

**Verification:**
- ✅ Only published profiles show in directory
- ✅ Unpublished profiles hidden
- ✅ Search/filters still work

**Stop for confirmation** ✋

---

#### **STEP 4: Add Publish/Unpublish Toggle in Dashboard** 🎛️

**Files Changed:**
- `src/routes/api/instructors/[id]/publish/+server.ts` (1 new file)
- `src/routes/dashboard/profile/+page.svelte` (1 file)
- `src/routes/dashboard/profile/+page.server.ts` (1 file - pass `isPublished`)

**API Endpoint:**
```typescript
// src/routes/api/instructors/[id]/publish/+server.ts
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/utils/auth';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { error, json } from '@sveltejs/kit';

const instructorService = new InstructorService();

export const POST: RequestHandler = async (event) => {
    const user = await requireAuth(event);
    const instructorId = parseInt(event.params.id);

    if (user.id !== instructorId && user.role !== 'admin') {
        throw error(403, 'Unauthorized');
    }

    const { isPublished } = await event.request.json();

    await instructorService.updateInstructorPublishStatus(instructorId, isPublished);

    return json({ success: true, isPublished });
};
```

**Service Method:**
```typescript
// Add to InstructorService
async updateInstructorPublishStatus(instructorId: number, isPublished: boolean): Promise<void> {
    await this.instructorRepository.updateInstructor(instructorId, { isPublished });
}
```

**Frontend Toggle:**
```svelte
<!-- In dashboard/profile/+page.svelte -->
<div class="flex items-center gap-3 rounded-lg border p-4">
    <Switch
        bind:checked={isPublished}
        onCheckedChange={handlePublishToggle}
    />
    <div>
        <p class="font-medium">
            {isPublished ? 'Profile Published' : 'Profile Draft'}
        </p>
        <p class="text-sm text-muted-foreground">
            {isPublished
                ? 'Your profile is visible in the directory'
                : 'Your profile is hidden from the directory'}
        </p>
    </div>
</div>

{#if !isPublished}
    <div class="rounded-lg bg-yellow-50 p-4 text-yellow-800">
        ⚠️ Your profile is currently in draft mode and not visible to clients.
    </div>
{/if}
```

**Testing:**
```bash
# Manual test:
1. Login as instructor
2. Go to /dashboard/profile
3. Toggle publish status
4. Verify status updates
5. Check /instructors directory (open in incognito)
6. Verify profile appears/disappears based on toggle
```

**Verification:**
- ✅ Toggle updates status immediately
- ✅ Profile visibility changes in directory
- ✅ Clear visual indication of draft vs published
- ✅ Only instructor (or admin) can toggle own profile

**Stop for confirmation** ✋

---

#### **STEP 5: Implement School Email Notifications** 📧

**Files Changed:**
- `src/lib/server/webhooks/n8n/email-n8n.ts` (1 file - add 6 functions)
- `src/features/Schools/lib/schoolInstructorService.ts` (1 file - replace TODOs)

**Email Functions to Add:**

```typescript
// src/lib/server/webhooks/n8n/email-n8n.ts

export async function sendInstructorInvitation(data: {
    instructorEmail: string;
    instructorName: string;
    schoolName: string;
    schoolSlug: string;
    invitationUrl: string;
}) {
    const n8nUrl = `${config.N8N_WEBHOOK_BASE_URL}/school-instructor-invitation`;
    return sendWebhookRequest(n8nUrl, data);
}

export async function sendSchoolApplication(data: {
    schoolAdminEmail: string;
    schoolName: string;
    instructorName: string;
    instructorId: number;
    reviewUrl: string;
}) {
    const n8nUrl = `${config.N8N_WEBHOOK_BASE_URL}/school-application`;
    return sendWebhookRequest(n8nUrl, data);
}

export async function sendInstructorAccepted(data: {
    instructorEmail: string;
    instructorName: string;
    schoolName: string;
    schoolSlug: string;
    dashboardUrl: string;
}) {
    const n8nUrl = `${config.N8N_WEBHOOK_BASE_URL}/school-instructor-accepted`;
    return sendWebhookRequest(n8nUrl, data);
}

export async function sendInstructorRejected(data: {
    instructorEmail: string;
    instructorName: string;
    schoolName: string;
}) {
    const n8nUrl = `${config.N8N_WEBHOOK_BASE_URL}/school-instructor-rejected`;
    return sendWebhookRequest(n8nUrl, data);
}

export async function sendInvitationAccepted(data: {
    schoolAdminEmail: string;
    schoolName: string;
    instructorName: string;
    instructorId: number;
}) {
    const n8nUrl = `${config.N8N_WEBHOOK_BASE_URL}/school-invitation-accepted`;
    return sendWebhookRequest(n8nUrl, data);
}

export async function sendInstructorDeactivated(data: {
    instructorEmail: string;
    instructorName: string;
    schoolName: string;
}) {
    const n8nUrl = `${config.N8N_WEBHOOK_BASE_URL}/school-instructor-deactivated`;
    return sendWebhookRequest(n8nUrl, data);
}
```

**Replace TODOs in schoolInstructorService.ts:**
```typescript
// Line ~120 - Replace console.log with:
try {
    await sendInstructorInvitation({
        instructorEmail: instructor.email,
        instructorName: `${instructor.name} ${instructor.lastName}`,
        schoolName: school.name,
        schoolSlug: school.name, // slug
        invitationUrl: `${BASE_URL}/dashboard/invitations`
    });
} catch (error) {
    console.error('Failed to send invitation email:', error);
}

// Repeat for all 6 TODO locations
```

**Testing:**
```bash
# Manual test:
1. Create school admin account
2. Invite instructor → Check instructor email
3. Instructor applies to school → Check school admin email
4. Accept instructor → Check instructor email
5. Reject instructor → Check instructor email
6. Instructor accepts invitation → Check school admin email
7. Remove instructor → Check instructor email
```

**Verification:**
- ✅ All 6 email types sent successfully
- ✅ Email content correct (names, links work)
- ✅ No errors in console
- ✅ Fallback works if email fails (doesn't break flow)

**Stop for confirmation** ✋

---

#### **STEP 6: Create Instructor Leads Table & Service** 🗄️

**Files Changed:**
- `drizzle/migrations/0028_add_instructor_leads.sql` (1 new file)
- `src/lib/server/db/schema.ts` (1 file - add table)
- `src/features/Leads/lib/leadRepository.ts` (1 new file)
- `src/features/Leads/lib/leadService.ts` (1 new file)

**Migration:**
```sql
CREATE TABLE instructor_leads (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_name VARCHAR(100),
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instructor_leads_instructor ON instructor_leads(instructor_id);
CREATE INDEX idx_instructor_leads_created ON instructor_leads(created_at DESC);
CREATE INDEX idx_instructor_leads_status ON instructor_leads(status);
```

**Schema:**
```typescript
export const instructorLeads = pgTable('instructor_leads', {
    id: serial('id').primaryKey(),
    uuid: uuid('uuid').defaultRandom().unique().notNull(),
    instructorId: integer('instructor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    clientName: varchar('client_name', { length: 100 }),
    clientEmail: varchar('client_email', { length: 255 }).notNull(),
    clientPhone: varchar('client_phone', { length: 20 }),
    message: text('message').notNull(),
    status: varchar('status', { length: 20 }).default('new'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});
```

**Testing:**
```bash
# Run migration
npm run db:push

# Verify table exists
psql $DATABASE_URL -c "\d instructor_leads"
```

**Verification:**
- ✅ Table created successfully
- ✅ Indexes created
- ✅ Foreign key constraint works

**Stop for confirmation** ✋

---

#### **STEP 7: Add Instructor Contact Form Email Function** 📧

**Files Changed:**
- `src/lib/server/webhooks/n8n/email-n8n.ts` (1 file)

**Email Function:**
```typescript
export async function sendInstructorContactForm(data: {
    instructorEmail: string;
    instructorName: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    message: string;
    instructorProfileUrl: string;
}) {
    const n8nUrl = `${config.N8N_WEBHOOK_BASE_URL}/instructor-contact-form`;
    return sendWebhookRequest(n8nUrl, data);
}
```

**Testing:**
```bash
# Will test in next step when API endpoint created
```

**Verification:**
- ✅ Function added without syntax errors

**Stop for confirmation** ✋

---

#### **STEP 8: Create Instructor Contact API Endpoint with Rate Limiting** 🛡️

**Files Changed:**
- `src/routes/api/instructors/[id]/contact/+server.ts` (1 new file)
- `src/lib/server/rate-limit.ts` (1 file - add bucket for contact forms)

**Rate Limiter:**
```typescript
// Add to src/lib/server/rate-limit.ts
export const instructorContactBucket = new RefillingTokenBucket<string>(10, 1 / 3600); // 10 per hour
```

**API Endpoint:**
```typescript
// src/routes/api/instructors/[id]/contact/+server.ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { getClientIP } from '$lib/utils/auth';
import { instructorContactBucket } from '$lib/server/rate-limit';
import { LeadService } from '$src/features/Leads/lib/leadService';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { sendInstructorContactForm } from '$lib/server/webhooks/n8n/email-n8n';
import { z } from 'zod';

const leadService = new LeadService();
const instructorService = new InstructorService();

const contactSchema = z.object({
    clientName: z.string().min(1).max(100),
    clientEmail: z.string().email().max(255),
    clientPhone: z.string().max(20).optional(),
    message: z.string().min(1).max(1000)
});

export const POST: RequestHandler = async (event) => {
    const instructorId = parseInt(event.params.id);

    // Rate limiting
    const clientIP = getClientIP(event);
    if (clientIP !== null && !instructorContactBucket.check(clientIP, 1)) {
        throw error(429, 'Too many contact requests. Please try again later.');
    }

    // Validate input
    const body = await event.request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
        throw error(400, 'Invalid input');
    }

    const data = result.data;

    // Get instructor
    const instructor = await instructorService.getInstructorById(instructorId);
    if (!instructor) {
        throw error(404, 'Instructor not found');
    }

    // Consume rate limit token
    if (clientIP !== null) {
        instructorContactBucket.consume(clientIP, 1);
    }

    // Save lead
    await leadService.createLead({
        instructorId,
        ...data
    });

    // Send email to instructor
    try {
        await sendInstructorContactForm({
            instructorEmail: instructor.email,
            instructorName: `${instructor.name} ${instructor.lastName}`,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone,
            message: data.message,
            instructorProfileUrl: `${event.url.origin}/instructors/${instructorId}`
        });
    } catch (error) {
        console.error('Failed to send contact email:', error);
        // Don't fail the request if email fails
    }

    return json({ success: true });
};
```

**Testing:**
```bash
# Manual test with curl:
curl -X POST http://localhost:5173/api/instructors/1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test Client",
    "clientEmail": "test@test.com",
    "message": "Hello, I would like to book a lesson."
  }'

# Test rate limiting (send 11 requests rapidly):
for i in {1..11}; do
  curl -X POST http://localhost:5173/api/instructors/1/contact \
    -H "Content-Type: application/json" \
    -d '{"clientName":"Test","clientEmail":"test@test.com","message":"Test"}' &
done
```

**Verification:**
- ✅ Valid requests succeed (200)
- ✅ Invalid input rejected (400)
- ✅ Nonexistent instructor returns 404
- ✅ Rate limiting works (11th request = 429)
- ✅ Lead saved to database
- ✅ Email sent to instructor

**Stop for confirmation** ✋

---

#### **STEP 9: Add Contact Form UI to Instructor Profile Page** 🎨

**Files Changed:**
- `src/routes/instructors/[id]/+page.svelte` (1 file)
- `src/lib/components/ContactInstructorModal.svelte` (1 new file)

**Modal Component:**
```svelte
<!-- src/lib/components/ContactInstructorModal.svelte -->
<script lang="ts">
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Label } from '$lib/components/ui/label';
    import { toast } from 'svelte-sonner';

    export let open = false;
    export let instructorId: number;
    export let instructorName: string;

    let loading = false;
    let clientName = '';
    let clientEmail = '';
    let clientPhone = '';
    let message = '';

    async function handleSubmit() {
        if (!clientName || !clientEmail || !message) {
            toast.error('Please fill in all required fields');
            return;
        }

        loading = true;

        try {
            const response = await fetch(`/api/instructors/${instructorId}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName,
                    clientEmail,
                    clientPhone: clientPhone || undefined,
                    message
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send message');
            }

            toast.success('Message sent successfully!');
            open = false;

            // Reset form
            clientName = '';
            clientEmail = '';
            clientPhone = '';
            message = '';
        } catch (error) {
            toast.error(error.message);
        } finally {
            loading = false;
        }
    }
</script>

<Dialog bind:open>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Contact {instructorName}</DialogTitle>
        </DialogHeader>

        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div>
                <Label for="name">Your Name *</Label>
                <Input id="name" bind:value={clientName} required maxlength={100} />
            </div>

            <div>
                <Label for="email">Your Email *</Label>
                <Input id="email" type="email" bind:value={clientEmail} required maxlength={255} />
            </div>

            <div>
                <Label for="phone">Your Phone (optional)</Label>
                <Input id="phone" type="tel" bind:value={clientPhone} maxlength={20} />
            </div>

            <div>
                <Label for="message">Message *</Label>
                <Textarea
                    id="message"
                    bind:value={message}
                    required
                    maxlength={1000}
                    placeholder="Tell the instructor about your skiing experience and what you're looking for..."
                    rows={5}
                />
                <p class="text-sm text-muted-foreground mt-1">
                    {message.length} / 1000 characters
                </p>
            </div>

            <div class="flex justify-end gap-2">
                <Button type="button" variant="outline" on:click={() => open = false}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                </Button>
            </div>
        </form>
    </DialogContent>
</Dialog>
```

**Add to Profile Page:**
```svelte
<!-- In src/routes/instructors/[id]/+page.svelte -->
<script>
    import ContactInstructorModal from '$lib/components/ContactInstructorModal.svelte';

    let showContactModal = false;
</script>

<!-- Add button near booking button -->
<div class="flex gap-3">
    <Button on:click={() => showContactModal = true} variant="outline" class="flex-1">
        📧 Send Quick Message
    </Button>
    <Button href="/booking?instructor={data.instructor.id}" class="flex-1">
        📅 Request Booking
    </Button>
</div>

<ContactInstructorModal
    bind:open={showContactModal}
    instructorId={data.instructor.id}
    instructorName="{data.instructor.name} {data.instructor.lastName}"
/>
```

**Testing:**
```bash
# Manual test:
1. Visit /instructors/[id]
2. Click "Send Quick Message"
3. Fill form with valid data → Submit
4. Verify success toast
5. Check instructor email inbox
6. Verify lead in database
7. Try submitting with invalid email → Verify error
8. Try submitting 11 times → Verify rate limit
```

**Verification:**
- ✅ Modal opens and closes correctly
- ✅ Form validation works
- ✅ Success message shows
- ✅ Email received by instructor
- ✅ Lead stored in database
- ✅ Rate limiting prevents spam

**Stop for confirmation** ✋

---

#### **STEP 10: Add Lead Analytics to Instructor Dashboard** 📊

**Files Changed:**
- `src/routes/dashboard/+page.server.ts` (1 file - load leads)
- `src/routes/dashboard/+page.svelte` (1 file - display leads)
- `src/features/Leads/lib/leadService.ts` (1 file - add methods)

**Service Methods:**
```typescript
// Add to LeadService
async getInstructorLeads(instructorId: number, limit = 10) {
    return await this.leadRepository.getLeadsByInstructor(instructorId, limit);
}

async getInstructorLeadStats(instructorId: number) {
    const allLeads = await this.leadRepository.getLeadsByInstructor(instructorId, 1000);

    const now = new Date();
    const thisMonth = allLeads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.getMonth() === now.getMonth() &&
               leadDate.getFullYear() === now.getFullYear();
    });

    return {
        total: allLeads.length,
        thisMonth: thisMonth.length,
        new: allLeads.filter(l => l.status === 'new').length
    };
}
```

**Load Data:**
```typescript
// src/routes/dashboard/+page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;

    if (!user) {
        throw redirect(302, '/login');
    }

    // ... existing code ...

    // Add for instructors:
    if (user.role === 'instructor-independent' || user.role === 'instructor-school') {
        const leadService = new LeadService();
        const leadStats = await leadService.getInstructorLeadStats(user.id);
        const recentLeads = await leadService.getInstructorLeads(user.id, 5);

        return {
            user,
            // ... existing data ...
            leadStats,
            recentLeads
        };
    }

    // ... rest of code ...
};
```

**Display in Dashboard:**
```svelte
<!-- In src/routes/dashboard/+page.svelte -->
{#if user.role.includes('instructor')}
    <div class="grid gap-4 md:grid-cols-3">
        <!-- Existing profile visits card -->

        <!-- NEW: Leads Card -->
        <div class="rounded-lg border bg-card p-6">
            <h3 class="text-sm font-medium text-muted-foreground">Contact Forms</h3>
            <div class="mt-2 flex items-baseline gap-2">
                <p class="text-3xl font-bold">{data.leadStats.thisMonth}</p>
                <span class="text-sm text-muted-foreground">this month</span>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">
                {data.leadStats.total} total • {data.leadStats.new} new
            </p>
        </div>

        <!-- Existing bookings card -->
    </div>

    <!-- Recent Leads Section -->
    {#if data.recentLeads.length > 0}
        <div class="mt-8 rounded-lg border bg-card p-6">
            <h2 class="text-xl font-semibold mb-4">Recent Messages</h2>
            <div class="space-y-4">
                {#each data.recentLeads as lead}
                    <div class="flex items-start gap-4 rounded-lg border p-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <p class="font-medium">{lead.clientName}</p>
                                <span class="text-sm text-muted-foreground">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </span>
                                {#if lead.status === 'new'}
                                    <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                        New
                                    </span>
                                {/if}
                            </div>
                            <p class="text-sm text-muted-foreground mt-1">{lead.clientEmail}</p>
                            <p class="mt-2 text-sm">{lead.message}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
{/if}
```

**Testing:**
```bash
# Manual test:
1. Login as instructor
2. Go to /dashboard
3. Verify lead stats card shows correct numbers
4. Verify recent leads section shows latest messages
5. Submit new contact form
6. Refresh dashboard
7. Verify count incremented and new message appears
```

**Verification:**
- ✅ Lead stats accurate
- ✅ Recent leads display correctly
- ✅ New status badge shows for unread leads
- ✅ Counts update when new lead submitted

**Stop for confirmation** ✋

---

#### **STEP 11: Create Public School Directory Page** 🏫

**Files Changed:**
- `src/routes/schools/+page.server.ts` (1 new file)
- `src/routes/schools/+page.svelte` (1 new file)
- `src/features/Schools/lib/schoolRepository.ts` (1 file - add method)

**Repository Method:**
```typescript
// Add to SchoolRepository
async getPublishedSchools(filters?: {
    resortId?: number;
    sportId?: number;
    searchQuery?: string;
}) {
    let query = db
        .select({
            id: schools.id,
            name: schools.name,
            bio: schools.bio,
            logo: schools.logo,
            isVerified: schools.isVerified,
            instructorCount: sql<number>`(
                SELECT COUNT(*)
                FROM school_instructors
                WHERE school_id = ${schools.id}
                AND is_active = true
            )`.as('instructorCount')
        })
        .from(schools)
        .where(eq(schools.isPublished, true))
        .$dynamic();

    if (filters?.resortId) {
        query = query
            .leftJoin(schoolResorts, eq(schools.id, schoolResorts.schoolId))
            .where(eq(schoolResorts.resortId, filters.resortId));
    }

    if (filters?.sportId) {
        query = query
            .leftJoin(schoolSports, eq(schools.id, schoolSports.schoolId))
            .where(eq(schoolSports.sportId, filters.sportId));
    }

    if (filters?.searchQuery) {
        query = query.where(
            sql`${schools.name} ILIKE ${'%' + filters.searchQuery + '%'}`
        );
    }

    return await query;
}
```

**Page Server:**
```typescript
// src/routes/schools/+page.server.ts
import type { PageServerLoad } from './$types';
import { SchoolService } from '$src/features/Schools/lib/schoolService';
import { ResortService } from '$src/features/Resorts/lib/resortService';
import { SportService } from '$src/features/Sports/lib/sportService';

const schoolService = new SchoolService();
const resortService = new ResortService();
const sportService = new SportService();

export const load: PageServerLoad = async ({ url }) => {
    const resortId = url.searchParams.get('resort') ? parseInt(url.searchParams.get('resort')!) : undefined;
    const sportId = url.searchParams.get('sport') ? parseInt(url.searchParams.get('sport')!) : undefined;
    const searchQuery = url.searchParams.get('q') || undefined;

    const [schools, resorts, sports] = await Promise.all([
        schoolService.getPublishedSchools({ resortId, sportId, searchQuery }),
        resortService.getAllResorts(),
        sportService.getAllSports()
    ]);

    return {
        schools,
        resorts,
        sports,
        filters: { resortId, sportId, searchQuery }
    };
};
```

**Page UI:**
```svelte
<!-- src/routes/schools/+page.svelte -->
<script lang="ts">
    import { t } from '$lib/i18n/i18n';
    import { route } from '$lib/i18n/routeHelpers';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<svelte:head>
    <title>{$t('schools_directory_title')} | Local Snow</title>
    <meta name="description" content={$t('schools_directory_description')} />
</svelte:head>

<div class="container mx-auto py-8">
    <h1 class="title1 mb-2">Ski & Snowboard Schools</h1>
    <p class="text-lg text-muted-foreground mb-8">
        Discover professional ski and snowboard schools across Spanish resorts
    </p>

    <!-- Filters -->
    <div class="mb-8 flex flex-wrap gap-4">
        <select name="resort" class="rounded-md border px-4 py-2">
            <option value="">All Resorts</option>
            {#each data.resorts as resort}
                <option value={resort.id} selected={data.filters.resortId === resort.id}>
                    {resort.name}
                </option>
            {/each}
        </select>

        <select name="sport" class="rounded-md border px-4 py-2">
            <option value="">All Sports</option>
            {#each data.sports as sport}
                <option value={sport.id} selected={data.filters.sportId === sport.id}>
                    {sport.sport}
                </option>
            {/each}
        </select>

        <input
            type="search"
            name="q"
            placeholder="Search schools..."
            value={data.filters.searchQuery || ''}
            class="rounded-md border px-4 py-2"
        />
    </div>

    <!-- School Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each data.schools as school}
            <a
                href={route(`/schools/${school.name}`)}
                class="group rounded-lg border bg-card p-6 transition hover:shadow-lg"
            >
                <div class="flex items-start gap-4">
                    {#if school.logo}
                        <img
                            src={school.logo}
                            alt={school.name}
                            class="h-16 w-16 rounded-lg object-cover"
                        />
                    {:else}
                        <div class="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                            <span class="text-2xl">🏫</span>
                        </div>
                    {/if}

                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <h3 class="font-semibold group-hover:text-primary">
                                {school.name}
                            </h3>
                            {#if school.isVerified}
                                <span class="text-primary" title="Verified School">✓</span>
                            {/if}
                        </div>

                        <p class="mt-1 text-sm text-muted-foreground">
                            {school.instructorCount} instructor{school.instructorCount !== 1 ? 's' : ''}
                        </p>

                        {#if school.bio}
                            <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                {school.bio}
                            </p>
                        {/if}
                    </div>
                </div>
            </a>
        {/each}
    </div>

    {#if data.schools.length === 0}
        <div class="rounded-lg border bg-card p-12 text-center">
            <p class="text-lg text-muted-foreground">No schools found matching your criteria.</p>
        </div>
    {/if}
</div>
```

**Testing:**
```bash
# Manual test:
1. Visit /schools
2. Verify published schools appear
3. Test resort filter
4. Test sport filter
5. Test search
6. Click school card → Should navigate to school profile
```

**Verification:**
- ✅ Only published schools shown
- ✅ Filters work correctly
- ✅ Search works
- ✅ Instructor count accurate
- ✅ Links work

**Stop for confirmation** ✋

---

#### **STEP 12: Create School Public Profile Page** 🏫

**Files Changed:**
- `src/routes/schools/[slug]/+page.server.ts` (1 new file)
- `src/routes/schools/[slug]/+page.svelte` (1 new file)
- `src/features/Schools/lib/schoolRepository.ts` (1 file - add method)

**Repository Method:**
```typescript
// Add to SchoolRepository
async getSchoolBySlugWithInstructors(slug: string) {
    const school = await db
        .select()
        .from(schools)
        .where(and(
            eq(schools.name, slug), // Using name as slug
            eq(schools.isPublished, true)
        ))
        .limit(1);

    if (school.length === 0) return null;

    // Get instructors
    const instructors = await db
        .select({
            id: users.id,
            name: users.name,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            bio: users.bio,
            isVerified: users.isVerified
        })
        .from(schoolInstructors)
        .innerJoin(users, eq(schoolInstructors.instructorId, users.id))
        .where(and(
            eq(schoolInstructors.schoolId, school[0].id),
            eq(schoolInstructors.isActive, true),
            eq(users.isPublished, true)
        ));

    // Get sports
    const sports = await db
        .select({ sportId: schoolSports.sportId })
        .from(schoolSports)
        .where(eq(schoolSports.schoolId, school[0].id));

    // Get resorts
    const resorts = await db
        .select({
            id: resorts.id,
            name: resorts.name,
            slug: resorts.slug
        })
        .from(schoolResorts)
        .innerJoin(resorts, eq(schoolResorts.resortId, resorts.id))
        .where(eq(schoolResorts.schoolId, school[0].id));

    return {
        ...school[0],
        instructors,
        sports: sports.map(s => s.sportId),
        resorts
    };
}
```

**Page Server:**
```typescript
// src/routes/schools/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { SchoolService } from '$src/features/Schools/lib/schoolService';

const schoolService = new SchoolService();

export const load: PageServerLoad = async ({ params }) => {
    const school = await schoolService.getSchoolBySlugWithInstructors(params.slug);

    if (!school) {
        throw error(404, 'School not found');
    }

    return { school };
};
```

**Page UI:**
```svelte
<!-- src/routes/schools/[slug]/+page.svelte -->
<script lang="ts">
    import { route } from '$lib/i18n/routeHelpers';
    import type { PageData } from './$types';

    export let data: PageData;
    const { school } = data;
</script>

<svelte:head>
    <title>{school.name} | Local Snow</title>
    <meta name="description" content={school.bio || `Ski school at ${school.name}`} />
</svelte:head>

<div class="container mx-auto py-8">
    <!-- School Header -->
    <div class="mb-8 flex items-start gap-6 rounded-lg border bg-card p-6">
        {#if school.logo}
            <img
                src={school.logo}
                alt={school.name}
                class="h-24 w-24 rounded-lg object-cover"
            />
        {:else}
            <div class="flex h-24 w-24 items-center justify-center rounded-lg bg-primary/10">
                <span class="text-5xl">🏫</span>
            </div>
        {/if}

        <div class="flex-1">
            <div class="flex items-center gap-2">
                <h1 class="title1">{school.name}</h1>
                {#if school.isVerified}
                    <span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        ✓ Verified
                    </span>
                {/if}
            </div>

            {#if school.bio}
                <p class="mt-2 text-muted-foreground">{school.bio}</p>
            {/if}

            <div class="mt-4 flex flex-wrap gap-4 text-sm">
                {#if school.schoolEmail}
                    <a href="mailto:{school.schoolEmail}" class="text-primary hover:underline">
                        📧 {school.schoolEmail}
                    </a>
                {/if}

                {#if school.schoolPhone}
                    <a href="tel:{school.countryCode}{school.schoolPhone}" class="text-primary hover:underline">
                        📞 {school.countryCode} {school.schoolPhone}
                    </a>
                {/if}
            </div>

            {#if school.resorts.length > 0}
                <div class="mt-4">
                    <p class="text-sm font-medium">Resorts:</p>
                    <div class="mt-1 flex flex-wrap gap-2">
                        {#each school.resorts as resort}
                            <a
                                href={route(`/resorts/${resort.slug}`)}
                                class="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80"
                            >
                                {resort.name}
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Instructors Section -->
    <div>
        <h2 class="title2 mb-6">Our Instructors ({school.instructors.length})</h2>

        {#if school.instructors.length > 0}
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {#each school.instructors as instructor}
                    <a
                        href={route(`/instructors/${instructor.id}`)}
                        class="group rounded-lg border bg-card p-4 transition hover:shadow-lg"
                    >
                        <div class="flex items-start gap-4">
                            <img
                                src={instructor.profileImageUrl || '/local-snow-head.png'}
                                alt={`${instructor.name} ${instructor.lastName}`}
                                class="h-16 w-16 rounded-full object-cover"
                            />

                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold group-hover:text-primary">
                                        {instructor.name} {instructor.lastName}
                                    </h3>
                                    {#if instructor.isVerified}
                                        <span class="text-primary" title="Verified">✓</span>
                                    {/if}
                                </div>

                                {#if instructor.bio}
                                    <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {instructor.bio}
                                    </p>
                                {/if}
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {:else}
            <div class="rounded-lg border bg-card p-12 text-center">
                <p class="text-muted-foreground">No instructors currently listed for this school.</p>
            </div>
        {/if}
    </div>
</div>
```

**Testing:**
```bash
# Manual test:
1. Visit /schools/[school-slug]
2. Verify school info displays correctly
3. Verify instructors list shows
4. Click instructor → Verify navigates to profile
5. Verify contact info clickable (email/phone)
6. Try invalid slug → Verify 404 error
```

**Verification:**
- ✅ School info displays correctly
- ✅ Instructors list accurate
- ✅ Links work
- ✅ 404 for invalid schools
- ✅ Only published instructors shown

**Stop for confirmation** ✋

---

#### **STEP 13: Add School Filter to Instructor Directory** 🔍

**Files Changed:**
- `src/features/Instructors/lib/instructorRepository.ts` (1 file)
- `src/routes/instructors/+page.server.ts` (1 file)
- `src/routes/instructors/+page.svelte` (1 file)

**Repository Update:**
```typescript
// In searchInstructors(), add schoolId to filters parameter
async searchInstructors(filters: {
    resortId?: number;
    sportId?: number;
    searchQuery?: string;
    language?: string;
    priceMin?: number;
    priceMax?: number;
    instructorType?: 'instructor-independent' | 'instructor-school';
    verifiedOnly?: boolean;
    schoolId?: number; // ADD THIS
    sortBy?: string;
}) {
    // ... existing query setup ...

    // Add school filter
    if (filters.schoolId) {
        query = query
            .leftJoin(schoolInstructors, eq(users.id, schoolInstructors.instructorId))
            .where(and(
                ...conditions,
                eq(schoolInstructors.schoolId, filters.schoolId),
                eq(schoolInstructors.isActive, true)
            ));
    }

    // ... rest of method ...
}
```

**Page Server Update:**
```typescript
// src/routes/instructors/+page.server.ts
export const load: PageServerLoad = async ({ url }) => {
    // ... existing params ...
    const schoolId = url.searchParams.get('school') ? parseInt(url.searchParams.get('school')!) : undefined;

    const instructors = await instructorService.searchInstructors({
        // ... existing filters ...
        schoolId
    });

    // Load schools for filter
    const schools = await schoolService.getPublishedSchools();

    return {
        instructors,
        // ... existing data ...
        schools,
        filters: { /* ... existing ...*/, schoolId }
    };
};
```

**Page UI Update:**
```svelte
<!-- In src/routes/instructors/+page.svelte -->
<!-- Add to filters section -->
<select name="school" class="rounded-md border px-4 py-2">
    <option value="">All Schools</option>
    <option value="independent">Independent Only</option>
    {#each data.schools as school}
        <option value={school.id} selected={data.filters.schoolId === school.id}>
            {school.name}
        </option>
    {/each}
</select>
```

**Testing:**
```bash
# Manual test:
1. Visit /instructors
2. Select school from filter
3. Verify only that school's instructors shown
4. Select "Independent Only"
5. Verify only independent instructors shown
6. Clear filter
7. Verify all instructors shown again
```

**Verification:**
- ✅ School filter works
- ✅ Independent filter works
- ✅ Filters combine correctly with other filters
- ✅ URL params update

**Stop for confirmation** ✋

---

#### **STEP 14: Add Rate Limiting to Booking Creation** 🛡️

**Files Changed:**
- `src/routes/api/bookings/create/+server.ts` (1 file)
- `src/lib/server/rate-limit.ts` (1 file)

**Rate Limiter:**
```typescript
// Add to src/lib/server/rate-limit.ts
export const bookingCreateBucket = new RefillingTokenBucket<string>(10, 1 / 3600); // 10 per hour
```

**API Update:**
```typescript
// In src/routes/api/bookings/create/+server.ts
// Add at top of POST handler:
import { bookingCreateBucket } from '$lib/server/rate-limit';
import { getClientIP } from '$lib/utils/auth';

export const POST: RequestHandler = async (event) => {
    // Rate limiting
    const clientIP = getClientIP(event);
    if (clientIP !== null && !bookingCreateBucket.check(clientIP, 1)) {
        throw error(429, 'Too many booking requests. Please try again later.');
    }

    // ... existing validation ...

    // Consume token before creating booking
    if (clientIP !== null) {
        bookingCreateBucket.consume(clientIP, 1);
    }

    // ... rest of handler ...
};
```

**Testing:**
```bash
# Manual test:
1. Create booking normally → Should work
2. Create 10 bookings rapidly → Should work
3. Create 11th booking → Should get 429 error
4. Wait 1 hour → Should work again
```

**Verification:**
- ✅ Rate limiting works
- ✅ Error message clear
- ✅ Doesn't affect legitimate users

**Stop for confirmation** ✋

---

#### **STEP 15: Final Testing & Documentation** ✅

**Files Changed:**
- `README.md` (1 file - update with directory mode info)
- `docs/audit-directory-mode.md` (1 file - mark as completed)
- `docs/plan-directory-mode.md` (1 file - mark as completed)

**Testing Checklist:**

**Regression Tests:**
- [ ] Existing signup flow works
- [ ] Existing login (email/password + Google) works
- [ ] Instructor profile creation works
- [ ] Booking flow works (request, accept, reject)
- [ ] School creation works
- [ ] Admin panel accessible
- [ ] Email notifications still sent (existing ones)

**New Feature Tests:**
- [ ] Profile publishing toggle works
- [ ] Unpublished profiles hidden from directory
- [ ] Instructor contact form works
- [ ] Rate limiting prevents spam
- [ ] Lead analytics display correctly
- [ ] School directory loads
- [ ] School profile page works
- [ ] School filter in instructor directory works
- [ ] All 6 school emails sent correctly

**Cross-Browser Testing:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (responsive)

**Performance:**
- [ ] Page load times acceptable
- [ ] No N+1 queries
- [ ] Images optimized
- [ ] Rate limiting doesn't cause false positives

**Security:**
- [ ] No email addresses exposed in public API
- [ ] Rate limiting active on all forms
- [ ] RBAC enforced on all protected routes
- [ ] No XSS vulnerabilities in user-generated content

**Documentation Update:**
```markdown
# README.md additions

## Directory Mode (2026)

LocalSnow operates as a FREE directory connecting ski/snowboard instructors with clients.

### Key Features
- 🔍 Public instructor & school directory
- 📧 Direct contact forms (no booking fees)
- 🏫 School management system
- ✅ Verification badges
- 📊 Lead analytics for instructors

### For Instructors
- Create profile (free)
- Publish/unpublish anytime
- Receive direct inquiries
- Track leads in dashboard

### For Schools
- Create school profile
- Invite instructors
- Manage team
- Showcase to clients

### Rate Limits
- Contact forms: 10/hour per IP
- Booking requests: 10/hour per IP
- General contact: 5/10min per IP
```

**Final Verification:**
```bash
# Run all tests
npm run test

# Check for TypeScript errors
npm run check

# Build for production
npm run build

# Verify build succeeds
```

**Stop for confirmation** ✋

---

#### **STEP 16: Commit, Push & Create Summary** 🚀

**Git Operations:**

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Pivot to FREE directory mode

- Fix booking cancellation bug (undefined variables)
- Add profile publishing controls (isPublished column)
- Implement 6 missing school email notifications
- Add instructor contact form with rate limiting
- Create instructor leads table and analytics
- Build public school directory (/schools)
- Create school public profile pages
- Add school filter to instructor directory
- Add rate limiting to booking creation
- Update documentation

Closes #[issue-number if applicable]"

# Push to branch
git push -u origin claude/pivot-free-directory-A6PR4
```

**Create Implementation Summary Document:**

Document what was changed, testing performed, and how to verify locally.

**Stop for final confirmation & next steps** ✋

---

## 4. Testing & Verification Plan

### 4.1 Local Testing Commands

**Setup Local Environment:**
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and other secrets

# Run migrations
npm run db:push

# Seed database (optional)
npm run db:seed

# Start dev server
npm run dev
```

**Database Verification:**
```bash
# Connect to database
psql $DATABASE_URL

# Check new tables
\dt instructor_leads

# Check new columns
\d users

# Check published instructors
SELECT id, name, role, is_published FROM users WHERE role LIKE 'instructor%';

# Check leads
SELECT * FROM instructor_leads ORDER BY created_at DESC LIMIT 5;
```

---

### 4.2 Manual Test Scenarios

#### Scenario 1: New Instructor Signup & Profile Publishing

```
1. Open http://localhost:5173/signup
2. Create account: test-instructor@test.com / Password123!
3. Verify email sent (check n8n logs or email inbox)
4. Navigate to /dashboard/choose-role/instructor
5. Fill profile form completely
6. Upload profile image and qualification
7. Submit → Verify success
8. Check dashboard → Verify "Profile Draft" status shown
9. Open incognito window → Navigate to /instructors
10. Verify instructor NOT visible
11. Back to dashboard → Toggle "Publish Profile"
12. Refresh incognito /instructors
13. Verify instructor NOW visible
14. Toggle back to draft
15. Verify instructor hidden again
```

**Expected:** Profile visibility controlled by publish toggle

---

#### Scenario 2: Client Contacts Instructor

```
1. Visit /instructors (no login)
2. Click any instructor profile
3. Click "Send Quick Message"
4. Fill form:
   - Name: Test Client
   - Email: client@test.com
   - Message: Hello, I'd like to book a lesson
5. Submit
6. Verify success toast
7. Check instructor's email inbox
8. Verify email received with client's message
9. Login as instructor → /dashboard
10. Verify lead count incremented
11. Verify message appears in "Recent Messages"
```

**Expected:** Contact flow works end-to-end

---

#### Scenario 3: Rate Limiting

```
# Test contact form rate limiting
1. Visit /instructors/[id]
2. Submit contact form 10 times (use script or manually)
3. Verify all 10 succeed
4. Submit 11th time
5. Verify 429 error
6. Wait 1 hour (or reset in DB)
7. Verify can submit again

# Test booking rate limiting
1. Visit /instructors/[id]
2. Submit booking request 10 times
3. Verify all 10 succeed
4. Submit 11th time
5. Verify 429 error
```

**Expected:** Rate limits prevent spam

---

#### Scenario 4: School Flow

```
1. Signup as school admin
2. Create school with logo
3. Navigate to /dashboard/school/instructors/discover
4. Search for instructor
5. Click "Invite"
6. Verify invitation created
7. Check instructor's email
8. Verify invitation email received
9. Login as instructor → /dashboard/invitations
10. Verify invitation shown
11. Click "Accept"
12. Verify acceptance email sent to school admin
13. Login as school admin
14. Verify instructor now in "Active Instructors"
15. Open incognito → Navigate to /schools
16. Find school in directory
17. Click school
18. Verify instructor shown on school page
19. Visit /instructors?school=[school-id]
20. Verify only that school's instructors shown
```

**Expected:** School flow works with all emails

---

### 4.3 Automated Testing

**Unit Tests:**
```bash
# Test lead service
npm run test -- leadService.test.ts

# Test instructor repository
npm run test -- instructorRepository.test.ts

# Test rate limiting
npm run test -- rate-limit.test.ts
```

**Integration Tests:**
```bash
# Test contact API endpoint
npm run test -- api/instructors/contact.test.ts

# Test publishing API
npm run test -- api/instructors/publish.test.ts

# Test school directory
npm run test -- routes/schools.test.ts
```

**E2E Tests (Playwright):**
```bash
# Test full signup → profile → publish flow
npm run test:e2e -- instructor-signup.spec.ts

# Test contact form flow
npm run test:e2e -- contact-instructor.spec.ts

# Test school flow
npm run test:e2e -- school-management.spec.ts
```

---

### 4.4 Performance Testing

**Load Testing:**
```bash
# Test directory page load
ab -n 100 -c 10 http://localhost:5173/instructors

# Test contact form endpoint
ab -n 50 -c 5 -p contact.json -T application/json \
  http://localhost:5173/api/instructors/1/contact

# Test school directory
ab -n 100 -c 10 http://localhost:5173/schools
```

**Database Query Analysis:**
```sql
-- Enable query logging
SET log_statement = 'all';

-- Check for N+1 queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check slow queries
SELECT query, mean_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

---

### 4.5 Security Audit

**Checklist:**
- [ ] No email addresses in public API responses
- [ ] Rate limiting active on all form endpoints
- [ ] RBAC enforced (try accessing admin routes as client)
- [ ] SQL injection prevented (Drizzle ORM parameterized queries)
- [ ] XSS prevented (Svelte auto-escapes)
- [ ] CSRF protection (SameSite cookies)
- [ ] Sensitive data encrypted (Google tokens, session IDs)
- [ ] HTTPS enforced in production (config.ts)
- [ ] File upload validation (image types, size limits)
- [ ] No stack traces exposed to clients

---

## 5. Rollback Strategy

### 5.1 If Critical Bug Found

**Immediate Rollback:**
```bash
# Revert to previous commit
git revert HEAD

# Or reset to before changes
git reset --hard [commit-before-changes]

# Force push (only if not in production)
git push -f origin claude/pivot-free-directory-A6PR4
```

**Database Rollback:**
```sql
-- Drop new tables
DROP TABLE IF EXISTS instructor_leads;

-- Drop new columns
ALTER TABLE users DROP COLUMN IF EXISTS is_published;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_published_role;
```

---

### 5.2 Rollback by Step

Each step is isolated and can be rolled back individually:

**Step 1 (Bug fix):** Just revert the file change
**Step 2-3 (Publishing):** Drop column, remove filter logic
**Step 5 (Emails):** Remove functions, restore console.log
**Step 6-9 (Contact forms):** Drop table, remove API endpoint, remove UI
**Step 10 (Analytics):** Remove UI, keep table for data
**Step 11-13 (Schools):** Remove routes, keep existing functionality

---

### 5.3 Partial Deployment

If needed, can deploy only certain steps:

**Minimal Viable Deploy:**
- Steps 1-5: Bug fix + publishing + school emails
- Skip contact forms initially
- Skip school directory initially

**Allows:**
- Fix critical bugs immediately
- Add features incrementally
- Reduce risk

---

## 6. Post-Implementation Monitoring

### 6.1 Metrics to Track

**Usage Metrics:**
- Profile publish/unpublish rate
- Contact form submission rate
- Lead conversion rate (contact → booking)
- School signup rate
- School invitation acceptance rate

**Performance Metrics:**
- Page load times (/instructors, /schools, profiles)
- API response times (contact, publish endpoints)
- Database query performance
- Rate limit hit rate (indicates abuse or legitimate high traffic)

**Error Metrics:**
- Rate limit 429 errors
- Failed email sends
- 404s on school profiles
- Failed contact form submissions

---

### 6.2 Alerts to Set Up

**Critical:**
- Email service down (n8n webhook failures)
- Database connection issues
- High rate of 500 errors

**Warning:**
- High rate limit hit rate (may need adjustment)
- Slow query times (> 500ms)
- High spam submission rate

---

## 7. Success Criteria

### 7.1 Feature Completeness

- ✅ All 15 steps completed without errors
- ✅ All tests passing
- ✅ All 6 school emails working
- ✅ Rate limiting active on all forms
- ✅ Profile publishing controls functional
- ✅ School directory publicly accessible
- ✅ Lead analytics visible to instructors

---

### 7.2 Quality Gates

- ✅ Zero TypeScript errors
- ✅ Build succeeds without warnings
- ✅ All manual test scenarios pass
- ✅ No N+1 queries in critical paths
- ✅ Page load times < 2 seconds
- ✅ API response times < 500ms
- ✅ Mobile responsive (tested on real devices)

---

### 7.3 User Acceptance

**Instructor Feedback:**
- Can easily publish/unpublish profile
- Receives contact form submissions immediately
- Can track leads in dashboard
- Understands school affiliation if applicable

**Client Feedback:**
- Can easily find instructors
- Contact form simple and fast
- Clear which instructors are verified
- School profiles informative

**School Admin Feedback:**
- Can invite instructors easily
- Receives email notifications
- School profile looks professional
- Can manage instructors effectively

---

## 8. Next Steps After Implementation

### 8.1 Immediate (Week 1)

1. **Monitor metrics** closely for bugs/issues
2. **Gather user feedback** from instructors and clients
3. **Fix any critical bugs** found in production
4. **Optimize slow queries** if found

---

### 8.2 Short-term (Month 1)

1. **SEO optimization**
   - Add structured data (Schema.org)
   - Generate dynamic OpenGraph images
   - Optimize meta descriptions

2. **Enhanced analytics**
   - Track search impressions
   - Measure CTR from search to profile
   - A/B test profile layouts

3. **Advanced lead management**
   - Add status tracking (new → contacted → converted)
   - Add notes to leads
   - Export leads to CSV

---

### 8.3 Long-term (Quarter 1)

1. **Profile moderation queue**
2. **Reporting/flagging system**
3. **Featured listings** (monetization opportunity)
4. **Advanced search** (sort by rating, reviews)
5. **Client testimonials** on profiles
6. **General contact page** form (if needed)

---

## 9. Conclusion

This plan provides a **clear, incremental path** to transform LocalSnow into a FREE directory mode while:

✅ Fixing critical bugs
✅ Adding essential features
✅ Maintaining existing functionality
✅ Minimizing risk
✅ Enabling quick iteration

**Recommended:** Proceed with **Option 1 (Minimal MVP)** using the **15-step execution plan** above. Each step is small, testable, and can be confirmed before moving forward.

**Estimated Timeline:** 10-14 days (with confirmations at each step)

**Ready to proceed?** Awaiting your "GO" command to begin Step 1.
