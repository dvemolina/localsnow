# N8N Email Webhooks

This is a scan of the codebase for all outbound email notifications and their n8n webhook endpoints.

## Base config

- Base URL is hardcoded in `src/lib/server/webhooks/n8n/email-n8n.ts` as `https://automation.personalflow.net/webhook`.
- Auth header: `x-n8n-secret` from `EMAIL_HEADER_SECRET`.
- `N8N_WEBHOOK_URL` exists in `.env.production.template` but is not used in code.

## Webhook inventory (in use)

| Webhook path | Function | Trigger (source) | Notes |
| --- | --- | --- | --- |
| `/797b1c35-f0fd-4b8c-a0a2-014d07e396ae` | `sendSignupEmail` | Email/password signup and OAuth signup: `src/routes/(auth)/signup/+page.server.ts`, `src/routes/api/auth/signup/+server.ts`, `src/routes/(auth)/oauth/google/callback/+server.ts` | Welcome/beta email |
| `/booking-notification-instructor` | `sendBookingNotificationToInstructor` | Booking request created: `src/routes/api/bookings/create/+server.ts`, `src/routes/instructors/[slug]/+page.server.ts` | Sent to instructor, or school admin if instructor belongs to a school |
| `/booking-confirmation-client` | `sendBookingConfirmationToClient` | Booking request created: `src/routes/api/bookings/create/+server.ts`, `src/routes/instructors/[slug]/+page.server.ts` | Confirmation to client |
| `/booking-cancellation-instructor` | `sendCancellationNotificationToInstructor` | Client cancels booking: `src/features/Bookings/lib/bookingRequestService.ts` (called from `src/routes/dashboard/my-bookings/+page.server.ts`) | Instructor cancellation notice |
| `/booking-cancellation-client` | `sendCancellationConfirmationToClient` | Client cancels booking: `src/features/Bookings/lib/bookingRequestService.ts` (called from `src/routes/dashboard/my-bookings/+page.server.ts`) | Client cancellation confirmation |
| `/school-instructor-invitation` | `sendInstructorInvitation` | School invites instructor: `src/features/Schools/lib/schoolInstructorService.ts` | Invitation to instructor |
| `/school-application` | `sendSchoolApplication` | Instructor applies to school: `src/features/Schools/lib/schoolInstructorService.ts` | Notification to school admin |
| `/school-instructor-accepted` | `sendInstructorAccepted` | School accepts instructor: `src/features/Schools/lib/schoolInstructorService.ts` | Acceptance email to instructor |
| `/school-instructor-rejected` | `sendInstructorRejected` | School rejects instructor: `src/features/Schools/lib/schoolInstructorService.ts` | Rejection email to instructor |
| `/school-invitation-accepted` | `sendInvitationAccepted` | Instructor accepts invitation: `src/features/Schools/lib/schoolInstructorService.ts` | Notification to school admin |
| `/school-instructor-deactivated` | `sendInstructorDeactivated` | School deactivates instructor: `src/features/Schools/lib/schoolInstructorService.ts` | Deactivation email to instructor |
| `/instructor-contact-form` | `sendInstructorContactForm` | Contact instructor form: `src/routes/api/instructors/[id]/contact/+server.ts` | Lead/contact email to instructor |

## Webhook defined but not currently used

| Webhook path | Function | Status | Notes |
| --- | --- | --- | --- |
| `/booking-contact-info` | `sendContactInfoToInstructor` | Not called in code | Defined in `src/lib/server/webhooks/n8n/email-n8n.ts` but no trigger found |

## Related n8n workflow notes (non-webhook)

- Reviews: `REVIEW_SYSTEM_INTEGRATION.md` suggests adding a review link to the booking confirmation email and optionally creating a review reminder workflow. These are n8n email content/workflow changes, not new webhook endpoints.

## Import-ready workflow templates

- See `docs/N8N_EMAIL_WORKFLOWS.md` for ready-to-import n8n workflow JSON files and setup notes.
