# N8N Email Workflows (Import Ready)

These workflows mirror the current email triggers in the Local Snow codebase. Each JSON file can be imported directly into n8n.

## Import notes

- Replace the SMTP credential in each workflow: `LocalSnow SMTP account`.
- The app sends `x-n8n-secret` header for authentication. If you want to enforce it, add an IF node that checks `headers["x-n8n-secret"]` before sending.
- Sender is set to `Local Snow <admin@localsnow.org>` with no reply-to.
- HTML uses the same visual style as your existing template (cards, green/blue headers).

## Workflows

| Email | Webhook path | File |
| --- | --- | --- |
| Signup welcome | `/797b1c35-f0fd-4b8c-a0a2-014d07e396ae` | `docs/n8n-workflows/signup-welcome.json` |
| Booking notification (instructor/admin) | `/booking-notification-instructor` | `docs/n8n-workflows/booking-notification-instructor.json` |
| Booking confirmation (client) | `/booking-confirmation-client` | `docs/n8n-workflows/booking-confirmation-client.json` |
| Booking cancellation (instructor) | `/booking-cancellation-instructor` | `docs/n8n-workflows/booking-cancellation-instructor.json` |
| Booking cancellation (client) | `/booking-cancellation-client` | `docs/n8n-workflows/booking-cancellation-client.json` |
| Instructor contact form | `/instructor-contact-form` | `docs/n8n-workflows/instructor-contact-form.json` |
| School invitation | `/school-instructor-invitation` | `docs/n8n-workflows/school-instructor-invitation.json` |
| School application | `/school-application` | `docs/n8n-workflows/school-application.json` |
| School instructor accepted | `/school-instructor-accepted` | `docs/n8n-workflows/school-instructor-accepted.json` |
| School instructor rejected | `/school-instructor-rejected` | `docs/n8n-workflows/school-instructor-rejected.json` |
| School invitation accepted | `/school-invitation-accepted` | `docs/n8n-workflows/school-invitation-accepted.json` |
| School instructor deactivated | `/school-instructor-deactivated` | `docs/n8n-workflows/school-instructor-deactivated.json` |
| Contact info unlocked (legacy/free model optional) | `/booking-contact-info` | `docs/n8n-workflows/booking-contact-info.json` |

## Payload reference

Payloads come from `src/lib/server/webhooks/n8n/email-n8n.ts`. If you change fields there, update the corresponding templates here.
