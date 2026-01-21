# Email Notifications System - Complete Reference

This document lists ALL email notification triggers in the LocalSnow platform.
Use this to set up webhooks in n8n or your email service.

## Email Notification Events

### 1. **User Registration & Authentication**

#### 1.1 Welcome Email
**Trigger:** User completes signup
**Recipient:** New user
**Data Available:**
```json
{
  "userId": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "role": null
}
```
**Template Variables:**
- `{{name}}` - User's full name
- `{{dashboardUrl}}` - Link to dashboard
- `{{chooseRoleUrl}}` - Link to role selection

---

### 2. **Instructor Profile & Verification**

#### 2.1 Instructor Profile Submitted for Review
**Trigger:** Instructor completes profile setup
**Recipient:** Admin
**Data Available:**
```json
{
  "instructorId": 123,
  "name": "John Instructor",
  "email": "john@example.com",
  "resorts": ["Verbier", "Zermatt"],
  "sports": ["Ski", "Snowboard"],
  "profileUrl": "/instructors/john-instructor"
}
```

#### 2.2 Instructor Profile Verified
**Trigger:** Admin verifies instructor profile
**Recipient:** Instructor
**Data Available:**
```json
{
  "instructorId": 123,
  "name": "John Instructor",
  "email": "john@example.com",
  "profileUrl": "/instructors/john-instructor",
  "isPublished": true
}
```

---

### 3. **Booking System**

#### 3.1 New Booking Request (Platform)
**Trigger:** Client submits booking request through platform
**Recipient:** Instructor
**Data Available:**
```json
{
  "bookingId": 456,
  "instructor": {
    "id": 123,
    "name": "John Instructor",
    "email": "john@example.com"
  },
  "client": {
    "name": "Jane Client",
    "email": "jane@example.com",
    "phone": "+41 79 123 4567"
  },
  "details": {
    "startDate": "2024-02-15",
    "endDate": "2024-02-17",
    "hoursPerDay": 3,
    "numberOfStudents": 2,
    "skillLevel": "Intermediate",
    "estimatedPrice": 450,
    "currency": "€"
  },
  "bookingUrl": "/dashboard/bookings/456"
}
```

#### 3.2 Booking Status Changed
**Trigger:** Instructor accepts/rejects booking
**Recipient:** Client
**Data Available:**
```json
{
  "bookingId": 456,
  "status": "accepted", // or "rejected"
  "instructor": {
    "name": "John Instructor",
    "email": "john@example.com",
    "phone": "+41 79 123 4567",
    "profileUrl": "/instructors/john-instructor"
  },
  "client": {
    "name": "Jane Client",
    "email": "jane@example.com"
  },
  "details": {
    "startDate": "2024-02-15",
    "endDate": "2024-02-17",
    "hoursPerDay": 3,
    "numberOfStudents": 2
  }
}
```

#### 3.3 Manual Booking Created
**Trigger:** Instructor creates manual booking
**Recipient:** Instructor (confirmation)
**Data Available:**
```json
{
  "bookingId": 789,
  "instructor": {
    "name": "John Instructor",
    "email": "john@example.com"
  },
  "client": {
    "name": "Jane Client",
    "email": "jane@example.com",
    "phone": "+41 79 123 4567"
  },
  "details": {
    "startDate": "2024-02-15",
    "hoursPerDay": 3,
    "manualPrice": 500
  }
}
```

#### 3.4 Booking Payment Received (Lead Payment)
**Trigger:** Client pays for contact info unlock
**Recipient:** Both Instructor and Client
**Data Available:**
```json
{
  "bookingId": 456,
  "paymentId": 789,
  "amount": 5.00,
  "currency": "EUR",
  "instructor": {
    "name": "John Instructor",
    "email": "john@example.com"
  },
  "client": {
    "name": "Jane Client",
    "email": "jane@example.com",
    "phone": "+41 79 123 4567" // Now unlocked
  }
}
```

---

### 4. **Review System**

#### 4.1 Review Invitation
**Trigger:** Booking status changes to "completed"
**Recipient:** Client
**Data Available:**
```json
{
  "bookingId": 456,
  "reviewToken": "abc123xyz",
  "instructor": {
    "name": "John Instructor"
  },
  "client": {
    "name": "Jane Client",
    "email": "jane@example.com"
  },
  "reviewUrl": "/review/abc123xyz"
}
```

#### 4.2 New Review Submitted
**Trigger:** Client submits review
**Recipient:** Instructor
**Data Available:**
```json
{
  "reviewId": 789,
  "instructor": {
    "name": "John Instructor",
    "email": "john@example.com"
  },
  "client": {
    "name": "Jane Client"
  },
  "rating": 5,
  "comment": "Great instructor!",
  "reviewDate": "2024-02-20"
}
```

---

### 5. **Lead/Contact Form System**

#### 5.1 New Lead Received
**Trigger:** Client submits contact form on instructor profile
**Recipient:** Instructor
**Data Available:**
```json
{
  "leadId": 123,
  "instructor": {
    "id": 456,
    "name": "John Instructor",
    "email": "john@example.com"
  },
  "client": {
    "name": "Jane Client",
    "email": "jane@example.com",
    "phone": "+41 79 123 4567",
    "preferredDates": "Feb 15-17",
    "numberOfStudents": 2,
    "skillLevel": "Intermediate",
    "message": "Looking for private lessons"
  },
  "leadUrl": "/dashboard/leads/123"
}
```

---

### 6. **School Management System**

#### 6.1 School Verification Request Submitted
**Trigger:** User requests access to school
**Recipient:** Admin (Platform Owner)
**Data Available:**
```json
{
  "requestId": 123,
  "requester": {
    "id": 456,
    "name": "John Admin",
    "email": "john@example.com",
    "role": "school-admin" // or null
  },
  "school": {
    "id": 789, // if existing
    "name": "Swiss Snow School",
    "slug": "swiss-snow-school"
  },
  "message": "I'm the director of this school...",
  "proofDocument": "https://...",
  "reviewUrl": "/admin/school-verifications"
}
```

#### 6.2 School Verification Approved
**Trigger:** Admin approves verification request
**Recipient:** Requester
**Data Available:**
```json
{
  "requestId": 123,
  "user": {
    "name": "John Admin",
    "email": "john@example.com"
  },
  "school": {
    "id": 789,
    "name": "Swiss Snow School",
    "slug": "swiss-snow-school",
    "dashboardUrl": "/dashboard/school"
  },
  "adminNotes": "Verified via phone call",
  "approvedAt": "2024-02-15T10:30:00Z"
}
```

#### 6.3 School Verification Rejected
**Trigger:** Admin rejects verification request
**Recipient:** Requester
**Data Available:**
```json
{
  "requestId": 123,
  "user": {
    "name": "John Admin",
    "email": "john@example.com"
  },
  "school": {
    "name": "Swiss Snow School"
  },
  "adminNotes": "Could not verify ownership",
  "rejectedAt": "2024-02-15T10:30:00Z"
}
```

#### 6.4 Instructor Applied to School
**Trigger:** Instructor submits application to join school
**Recipient:** School Admin
**Data Available:**
```json
{
  "applicationId": 456,
  "school": {
    "id": 789,
    "name": "Swiss Snow School"
  },
  "schoolAdmin": {
    "name": "School Director",
    "email": "director@swisssnow.ch"
  },
  "instructor": {
    "id": 123,
    "name": "John Instructor",
    "email": "john@example.com",
    "profileUrl": "/instructors/john-instructor"
  },
  "reviewUrl": "/dashboard/school/instructors/pending"
}
```

#### 6.5 School Application Accepted/Rejected
**Trigger:** School admin accepts/rejects instructor application
**Recipient:** Instructor
**Data Available:**
```json
{
  "applicationId": 456,
  "status": "accepted", // or "rejected"
  "school": {
    "name": "Swiss Snow School",
    "slug": "swiss-snow-school"
  },
  "instructor": {
    "name": "John Instructor",
    "email": "john@example.com"
  },
  "schoolDashboardUrl": "/dashboard/school" // if accepted
}
```

#### 6.6 Instructor Invited to School
**Trigger:** School admin sends invitation to instructor
**Recipient:** Instructor
**Data Available:**
```json
{
  "invitationId": 789,
  "school": {
    "name": "Swiss Snow School",
    "bio": "Leading ski school in Verbier",
    "logo": "https://..."
  },
  "instructor": {
    "name": "John Instructor",
    "email": "john@example.com"
  },
  "invitationUrl": "/dashboard/invitations"
}
```

---

### 7. **Launch Code / Beta Access**

#### 7.1 Launch Code Used
**Trigger:** User applies valid launch code
**Recipient:** Admin (optional tracking)
**Data Available:**
```json
{
  "userId": 123,
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "code": "BETA2025",
  "usedAt": "2024-02-15T10:30:00Z"
}
```

---

## Implementation Guide

### Webhook Structure

Each email trigger should send a POST request to your n8n webhook:

```http
POST https://your-n8n-instance.com/webhook/localsnow-emails
Content-Type: application/json

{
  "event": "booking.created",
  "timestamp": "2024-02-15T10:30:00Z",
  "data": {
    // Event-specific data from above
  }
}
```

### Event Names Reference

```typescript
enum EmailEvent {
  // User
  'user.registered' = 'user.registered',

  // Instructor
  'instructor.profile_submitted' = 'instructor.profile_submitted',
  'instructor.profile_verified' = 'instructor.profile_verified',

  // Bookings
  'booking.created' = 'booking.created',
  'booking.accepted' = 'booking.accepted',
  'booking.rejected' = 'booking.rejected',
  'booking.manual_created' = 'booking.manual_created',
  'booking.payment_received' = 'booking.payment_received',

  // Reviews
  'review.invitation_sent' = 'review.invitation_sent',
  'review.submitted' = 'review.submitted',

  // Leads
  'lead.received' = 'lead.received',

  // School Verification
  'school_verification.requested' = 'school_verification.requested',
  'school_verification.approved' = 'school_verification.approved',
  'school_verification.rejected' = 'school_verification.rejected',

  // School Applications
  'school_application.submitted' = 'school_application.submitted',
  'school_application.accepted' = 'school_application.accepted',
  'school_application.rejected' = 'school_application.rejected',
  'school_invitation.sent' = 'school_invitation.sent',

  // Launch Codes
  'launch_code.used' = 'launch_code.used'
}
```

### Priority Levels

**Critical (Send Immediately):**
- booking.created
- booking.payment_received
- lead.received
- school_verification.requested

**High (Send within 5 minutes):**
- booking.accepted
- booking.rejected
- instructor.profile_verified
- school_verification.approved/rejected
- school_application.submitted

**Medium (Can batch):**
- review.invitation_sent
- review.submitted
- school_application.accepted/rejected
- school_invitation.sent

**Low (Daily digest possible):**
- user.registered
- instructor.profile_submitted
- launch_code.used

---

## n8n Workflow Examples

### Example 1: Booking Created Email

```
Webhook (booking.created)
  ↓
Function Node (Format Data)
  ↓
Branch (Check if test mode)
  ↓
Send Email (via Gmail/SendGrid/etc)
  ↓
Update Database (mark email sent)
```

### Example 2: School Verification Request

```
Webhook (school_verification.requested)
  ↓
Function Node (Format Admin Email)
  ↓
Send Email to Admin
  ↓
Send Slack Notification (optional)
  ↓
Log to Database
```

---

## Email Templates Needed

### Required Templates:
1. ✅ Welcome Email
2. ✅ New Booking Request
3. ✅ Booking Accepted
4. ✅ Booking Rejected
5. ✅ Contact Info Unlocked
6. ✅ Review Request
7. ✅ New Lead Received
8. ✅ School Verification Request (to Admin)
9. ✅ School Access Granted
10. ✅ School Access Denied
11. ✅ Instructor Application Received
12. ✅ Application Accepted
13. ✅ Application Rejected
14. ✅ School Invitation

### Optional Templates:
- Instructor Profile Verified
- Manual Booking Confirmation
- Review Submitted Thank You
- Launch Code Welcome

---

## Testing Checklist

- [ ] Webhook endpoints configured in n8n
- [ ] All event types have email templates
- [ ] Test emails sent for each event type
- [ ] Unsubscribe links included (where required by law)
- [ ] Email tracking/analytics configured
- [ ] Rate limiting configured (prevent spam)
- [ ] Fallback/retry logic for failed sends
- [ ] Email preview in dev environment

---

## Next Steps

1. **Set up n8n webhooks** for each event type
2. **Create email templates** using your preferred service (SendGrid, Mailgun, etc.)
3. **Add webhook calls** to the codebase (I can help with this next!)
4. **Test each email flow** end-to-end
5. **Monitor delivery rates** and adjust as needed

Let me know when you're ready to implement the webhook calls in the code!
