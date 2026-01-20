# School Management System - Complete Implementation

## Overview
This document describes the complete school management system that allows instructors to list schools, school admins to claim schools, and provides a professional workflow for school discovery and association.

## Features Implemented

### 1. **School Listing (Instructor-Initiated)**
Instructors can create school listings when their school doesn't exist in the directory.
- **Route**: `/dashboard/schools/search`
- **API Endpoint**: `POST /api/schools/create-listing`
- **Features**:
  - Search for schools by name or location
  - Create unverified school listings if not found
  - Auto-association with created school
  - Duplicate detection
  - Resort and location filtering

### 2. **School Claiming (Admin-Initiated)**
School administrators can claim existing school listings to take ownership.
- **API Endpoints**:
  - `POST /api/schools/claim` - Submit claim request
  - `GET /api/schools/claim` - Get pending claims
  - `POST /api/schools/claim/[id]/review` - Approve/reject claims
- **Routes**:
  - `/dashboard/school/claims` - Review pending claims
  - `/dashboard/schools/search` - Search and claim schools
- **Features**:
  - Claim request with optional message
  - Current owner notification
  - Approve/reject workflow
  - Ownership transfer on approval
  - Automatic role update to school-admin

### 3. **Fixed Manual Booking Bug**
Resolved issue where instructor-school users creating manual bookings got database errors.
- **File Modified**: `src/routes/api/bookings/manual/+server.ts`
- **Fix**: Automatically lookup and set `school_id` for instructor-school users
- **Impact**: Manual bookings now properly associate with the instructor's school

### 4. **Enhanced School Search**
Powerful search functionality for finding schools.
- **API Endpoint**: `GET /api/schools/search`
- **Features**:
  - Search by school name or location
  - Filter by resort
  - Shows verification status
  - Indicates if school was listed by instructor vs school-admin
  - "Not found? Create it!" workflow

## Database Schema Changes

### New Table: `school_claims`
```sql
CREATE TABLE school_claims (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  claimant_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  current_owner_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status school_claim_status DEFAULT 'pending',
  message TEXT,
  response_message TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### New Enum: `school_claim_status`
```sql
CREATE TYPE school_claim_status AS ENUM('pending', 'approved', 'rejected');
```

### Modified Table: `schools`
Added new columns:
- `created_by` VARCHAR(50) - Tracks if created by 'instructor' or 'school-admin'
- `created_at`, `updated_at`, `deleted_at` - Standard timestamps

## File Structure

### Backend Services
```
src/features/Schools/lib/
├── schoolRepository.ts (Updated)
│   └── Added: searchSchools(), createInstructorListedSchool()
├── schoolService.ts (Updated)
│   └── Added: searchSchools(), createInstructorListedSchool()
├── schoolClaimRepository.ts (NEW)
│   └── Full CRUD for school claims
└── schoolClaimService.ts (NEW)
    └── Business logic for claim workflow
```

### API Routes
```
src/routes/api/
├── bookings/manual/+server.ts (Fixed - adds school_id)
└── schools/
    ├── search/+server.ts (NEW - search schools)
    ├── create-listing/+server.ts (NEW - create school listing)
    └── claim/
        ├── +server.ts (NEW - submit/get claims)
        └── [id]/review/+server.ts (NEW - approve/reject)
```

### UI Pages
```
src/routes/dashboard/
├── schools/
│   ├── +page.svelte (Existing - browse schools)
│   ├── +page.server.ts (Existing)
│   └── search/
│       ├── +page.svelte (NEW - search/create schools)
│       └── +page.server.ts (NEW)
└── school/
    └── claims/
        ├── +page.svelte (NEW - review claims)
        └── +page.server.ts (NEW)
```

### Navigation Updates
```
src/features/Dashboard/components/AppSidebar.svelte (Updated)
├── Added "Find Schools" to instructor-independent
├── Added "Find Schools" to instructor-school
├── Added "Find Schools" to school-admin
└── Added "Ownership Claims" to school-admin
```

## User Workflows

### For Instructors (instructor-independent / instructor-school)

#### Workflow 1: Finding and Joining a School
1. Navigate to **Dashboard > Find Schools**
2. Search for school by name or location
3. If found:
   - Click "Apply to Join"
   - Wait for school approval
4. If not found:
   - Click "Create School Listing"
   - Fill in school details
   - Submit (creates unverified school)
   - Auto-associated with the school
   - Role changes to instructor-school

#### Workflow 2: Creating Manual Bookings
1. Navigate to **Dashboard > Bookings**
2. Add manual booking
3. System automatically associates booking with instructor's school
4. Booking created successfully with school_id populated

### For School Administrators (school-admin)

#### Workflow 1: Claiming an Existing School
1. Navigate to **Dashboard > Find Schools**
2. Search for your school
3. If school exists but owned by someone else:
   - Click "Claim School"
   - Add message explaining why you should own it
   - Submit claim
4. Current owner reviews and approves/rejects
5. If approved: Ownership transferred, you become school-admin

#### Workflow 2: Reviewing Ownership Claims
1. Navigate to **Dashboard > Ownership Claims**
2. See list of pending claims for schools you own
3. For each claim:
   - Review claimant information and message
   - Approve: Transfers ownership to claimant
   - Reject: Denies claim with optional response

#### Workflow 3: Creating a School
1. Navigate to **Dashboard > Find Schools**
2. Search for school
3. If not found:
   - Click "Create School Listing"
   - Fill in details
   - Submit (creates verified school if you're school-admin)
   - You become the owner

## Security & Permissions

### Authorization Rules
- **Create Listing**: Only instructors (instructor-independent, instructor-school)
- **Claim School**: Only school-admin or users without role
- **Review Claims**: Only current school owner
- **Approve Claim**: Transfers ownership (irreversible without new claim)

### Data Validation
- School name uniqueness check (case-insensitive)
- Duplicate claim prevention (one pending claim per user/school)
- Required fields: name, resortId, countryCode
- Email and phone validation

## Migration File
```
drizzle/migrations/0046_add_school_claims_system.sql
```

## Testing Checklist

- [ ] Instructor can search for schools
- [ ] Instructor can create school listing when not found
- [ ] Created school is marked as unverified
- [ ] Instructor is auto-associated with created school
- [ ] School-admin can search for schools
- [ ] School-admin can claim a school
- [ ] School owner sees pending claims
- [ ] School owner can approve claim (ownership transfers)
- [ ] School owner can reject claim
- [ ] Manual bookings include school_id for instructor-school users
- [ ] Navigation links work correctly
- [ ] Duplicate school creation is prevented
- [ ] Duplicate claims are prevented

## Environment Setup

No new environment variables required. Uses existing:
- `DATABASE_URL` or `DATABASE_URL_FILE`

## Migration Instructions

To apply the migration in production:

```bash
# Run the migration script
node scripts/migrate.js

# Or using npm/pnpm
pnpm db:init
```

The migration is idempotent and safe to run multiple times.

## Industry Best Practices Followed

1. **Yelp/Google Business Model**: Anyone can list a business, owners can claim it
2. **Verification System**: Listings start unverified, admins can verify later
3. **Ownership Transfer**: Clean workflow with notifications
4. **Audit Trail**: All claims tracked with timestamps and messages
5. **Duplicate Prevention**: Search-first approach reduces duplicates
6. **Progressive Disclosure**: Simple search → create if needed → claim if exists
7. **Role-Based Access**: Clear permissions for each user type
8. **Reversibility**: Claims can be approved/rejected, new claims can transfer back

## Future Enhancements (Out of Scope)

- Email notifications for claim requests/responses
- Multi-admin support (multiple admins per school)
- School verification workflow (admin approves unverified schools)
- Automatic school data enrichment (pull from external APIs)
- School merging (combine duplicate listings)
- Claim dispute resolution
- Historical ownership tracking

## Support & Maintenance

For issues or questions:
- Check logs in `/api/schools/*` endpoints
- Review `school_claims` table for claim status
- Check `schools.created_by` to see listing origin
- Review `school_instructors` for instructor associations
