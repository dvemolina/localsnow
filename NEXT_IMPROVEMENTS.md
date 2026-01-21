# Next Improvements for School Management System

## Completed ✅
1. Fixed school profile page crash (isAccepted → isAcceptedBySchool)
2. Changed school claiming to admin-only verification system
3. Created admin review page for verification requests
4. Updated UI to guide users to request admin verification

## Remaining Tasks

### 1. School Selection During Role Signup

**Current State:**
- School-admin signup requires creating a new school
- No option to select/request existing school

**Proposed Solution:**
Add option in `/dashboard/choose-role/school-admin`:
- **Option A**: "I want to create a new school"
  - Current flow (create school form)
- **Option B**: "I want to manage an existing school"
  - Redirect to school search page
  - Submit verification request
  - Admin approves → User becomes school-admin

**Implementation:**
```
File: src/routes/dashboard/choose-role/school-admin/+page.svelte
Add radio buttons:
- Create New School
- Request Access to Existing School
Show appropriate form based on selection
```

### 2. School Leads System

**Question to Resolve:**
When an instructor who belongs to a school gets a lead, who should manage it?

**Option A: Instructor Manages Own Leads** (Recommended)
- Each instructor sees only their leads
- School admin has NO visibility
- Pros: Privacy, instructor independence
- Cons: School admin can't help manage

**Option B: School Admin Sees All Leads**
- School admin dashboard shows all instructor leads
- Can assign/reassign leads
- Pros: Centralized management
- Cons: Privacy concerns, complexity

**Option C: Hybrid** (Most Realistic)
- Instructors see their own leads
- School admin sees aggregate stats only
- Optional: Instructor can choose to share specific leads with admin

**Recommendation:**
Start with Option A (instructor-only). Can add Option C later if needed.

**Implementation:**
Current leads system already exists for instructors. No changes needed if we go with Option A.

If Option C is desired:
```sql
ALTER TABLE instructor_leads
ADD COLUMN shared_with_school BOOLEAN DEFAULT FALSE;
```

### 3. Manual Bookings for School Dashboard

**Current State:**
- Independent instructors can create manual bookings
- School dashboard has no manual booking option

**Proposed Solution:**
Add manual booking button to `/dashboard/school/bookings`

**Implementation:**
```
File: src/routes/dashboard/school/bookings/+page.svelte
- Add "Add Manual Booking" button
- Show dialog with:
  - Select Instructor (dropdown of school instructors)
  - Client info fields (name, email, phone)
  - Booking details (dates, hours, students)
  - Manual price (optional)
- On submit: Create booking with school_id

API endpoint already exists: POST /api/bookings/manual
Just need to:
1. Let school-admin use it
2. Add instructor selection dropdown
3. Auto-populate school_id from school admin's school
```

**Code Changes Needed:**
```typescript
// src/routes/dashboard/school/bookings/+page.server.ts
export const load = async (event) => {
  // ... existing code ...

  // Add: Get school instructors for manual booking dropdown
  const schoolInstructors = await db
    .select()
    .from(schoolInstructors)
    .innerJoin(users, eq(schoolInstructors.instructorId, users.id))
    .where(
      and(
        eq(schoolInstructors.schoolId, school.id),
        eq(schoolInstructors.isAcceptedBySchool, true)
      )
    );

  return { ...existingData, instructors: schoolInstructors };
};
```

```typescript
// src/routes/api/bookings/manual/+server.ts
// Update to allow school-admin to create bookings for their instructors

if (user.role === 'school-admin') {
  // Get school
  const school = await getSchoolByOwner(user.id);

  // Verify instructor belongs to school
  const instructorId = body.instructorId;
  const isInstructor = await verifyInstructorInSchool(instructorId, school.id);

  if (!isInstructor) {
    return json({ error: 'Instructor not in your school' }, { status: 403 });
  }

  // Create booking with school_id
  await createBooking({
    ...body,
    instructorId,
    schoolId: school.id
  });
}
```

### 4. Email Notifications (Future Enhancement)

**When to send emails:**
1. User submits verification request → Email admin
2. Admin approves/rejects request → Email user
3. Instructor gets lead → Email instructor
4. Manual booking created → Email instructor

**Implementation:**
- Use existing email service
- Add email templates for each scenario
- Trigger emails in service methods

### Priority Order

1. **HIGH**: School Selection During Signup
   - Blocke

r for school-admin onboarding
   - Easy to implement (just add option + redirect)

2. **MEDIUM**: Manual Bookings for Schools
   - Useful feature for school admins
   - Moderate implementation (1-2 hours)

3. **LOW**: Leads System Decision
   - Current system works fine
   - Only add if users request it

4. **FUTURE**: Email Notifications
   - Nice to have
   - Not blocking any workflows

## Migration Notes

When you're ready to deploy:

```bash
# Apply both migrations
node scripts/migrate.js

# Migrations to run:
# - 0046_add_school_claims_system.sql (from previous commit)
# - 0047_add_school_verification_requests.sql (from this commit)
```

## Testing Checklist

After completing remaining items:

- [ ] School-admin signup offers "create new" or "request existing"
- [ ] Requesting existing school submits verification request
- [ ] Admin can see and review verification requests
- [ ] Admin approval grants school-admin access
- [ ] School admin can create manual bookings for instructors
- [ ] Manual bookings appear in instructor's dashboard
- [ ] Instructors can see their leads (verify existing behavior)
- [ ] School profile page loads without errors

## Questions for User

1. **Leads**: Should school admins see instructor leads? (Yes/No/Stats Only)
2. **Manual Bookings**: Should school admin be required to select an instructor, or should they also be able to create "school bookings" not assigned to anyone?
3. **Verification**: Do you want email notifications when requests come in, or just check the admin dashboard?

## Summary

We've successfully:
- Fixed the school profile bug
- Converted to admin-only verification system
- Created admin review interface
- Set up professional onboarding workflow

Next steps are refinements to make the flow smoother during signup and add convenience features like manual bookings.
