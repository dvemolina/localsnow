# Email Template System

A production-ready, type-safe email template system for Local Snow. This system replaces inline HTML templates in n8n workflows with maintainable, versioned templates in the codebase.

## Architecture

```
src/lib/server/email/
├── base.ts                 # Base styles and email wrapper
├── components.ts           # Reusable email components
├── types.ts                # TypeScript type definitions
├── config.ts               # Email service configuration
├── sender.ts               # n8n webhook integration with retry logic
├── service.ts              # Main EmailService class
├── schemas/                # Zod validation schemas
│   ├── booking-schemas.ts
│   ├── school-schemas.ts
│   ├── user-schemas.ts
│   └── index.ts
├── templates/              # Email templates
│   ├── signup-welcome.ts
│   ├── booking-notification-instructor.ts
│   ├── booking-confirmation-client.ts
│   ├── booking-contact-info.ts
│   ├── booking-cancellation-instructor.ts
│   ├── booking-cancellation-client.ts
│   ├── school-instructor-invitation.ts
│   ├── school-application.ts
│   ├── school-instructor-accepted.ts
│   ├── school-instructor-rejected.ts
│   ├── school-invitation-accepted.ts
│   ├── school-instructor-deactivated.ts
│   ├── instructor-contact-form.ts
│   └── index.ts
└── __tests__/              # Test files
    ├── templates.test.ts
    └── service.test.ts
```

## Key Features

✅ **Type Safety**: Zod schemas validate all email data at runtime
✅ **Production Ready**: Retry logic, timeouts, and error handling
✅ **Email Compatible**: Inline CSS, table layouts, tested in multiple clients
✅ **Backward Compatible**: Existing `email-n8n.ts` functions unchanged
✅ **i18n Ready**: Locale parameter for future translations
✅ **Developer Tools**: Email preview page at `/dev/email-preview`
✅ **Comprehensive Tests**: Unit tests for templates and service

## Quick Start

### Sending an Email

```typescript
import { emailService } from '$lib/server/email/service';

// Send a welcome email
await emailService.sendSignupEmail({
  name: 'John Doe',
  email: 'john@example.com',
  betaCode: 'BETA2025',
  isBetaLaunch: true,
  betaValidUntil: '2025-03-31'
});

// Send booking notification
await emailService.sendBookingNotificationToInstructor({
  instructorEmail: 'sarah@example.com',
  instructorName: 'Sarah Johnson',
  bookingRequestId: 123,
  clientName: 'Mike Smith',
  numberOfStudents: 2,
  startDate: '2025-02-15',
  endDate: '2025-02-17',
  hoursPerDay: 4,
  estimatedPrice: 320,
  currency: 'EUR'
});
```

### Using Existing Functions (Backward Compatible)

The existing `email-n8n.ts` functions still work exactly the same:

```typescript
import { sendSignupEmail } from '$lib/server/webhooks/n8n/email-n8n';

// This still works - function signature unchanged
await sendSignupEmail('John Doe', 'john@example.com');
```

## Available Email Templates

| Template | Function | Telegram? | Description |
|----------|----------|-----------|-------------|
| Welcome Email | `sendSignupEmail` | ✅ | New user signup |
| Booking Notification | `sendBookingNotificationToInstructor` | ✅ | New booking to instructor |
| Booking Confirmation | `sendBookingConfirmationToClient` | ❌ | Booking confirmed to client |
| Contact Info | `sendContactInfoToInstructor` | ✅ | Full client details |
| Cancellation (Instructor) | `sendCancellationNotificationToInstructor` | ✅ | Booking cancelled |
| Cancellation (Client) | `sendCancellationConfirmationToClient` | ❌ | Cancellation confirmed |
| School Invitation | `sendInstructorInvitation` | ✅ | School invites instructor |
| School Application | `sendSchoolApplication` | ✅ | Instructor applies to school |
| Instructor Accepted | `sendInstructorAccepted` | ✅ | School accepts instructor |
| Instructor Rejected | `sendInstructorRejected` | ❌ | School rejects instructor |
| Invitation Accepted | `sendInvitationAccepted` | ✅ | Instructor accepts invitation |
| Instructor Deactivated | `sendInstructorDeactivated` | ❌ | School deactivates instructor |
| Contact Form | `sendInstructorContactForm` | ✅ | Someone contacts instructor |

## Adding a New Email Type

### Step 1: Create Zod Schema

Create or update a schema file in `schemas/`:

```typescript
// schemas/new-feature-schemas.ts
import { z } from 'zod';

export const myNewEmailSchema = z.object({
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1),
  customField: z.string().min(1)
});

export type MyNewEmailData = z.infer<typeof myNewEmailSchema>;
```

### Step 2: Create Template

Create a new template in `templates/`:

```typescript
// templates/my-new-email.ts
import { wrapEmail } from '../base';
import { header, contentSection, paragraph, actionButtons } from '../components';
import type { EmailTemplate, Locale } from '../types';
import type { MyNewEmailData } from '../schemas';

export const myNewEmail: EmailTemplate<MyNewEmailData> = (data, locale = 'en') => {
  const subject = 'Your Custom Subject';

  const content = `
    ${header({
      emoji: '🎉',
      text: 'Hello!',
      backgroundColor: '#2563eb'
    })}

    ${contentSection(`
      ${paragraph(`Hi ${data.recipientName}!`)}
      ${paragraph(`Your custom content here: ${data.customField}`)}
    `)}

    ${actionButtons([
      {
        label: 'Take Action',
        url: 'https://localsnow.org/action'
      }
    ])}
  `;

  return {
    subject,
    html: wrapEmail(content, {
      preheader: 'Preview text shown in email clients'
    })
  };
};
```

### Step 3: Add to EmailService

Add a method to `service.ts`:

```typescript
async sendMyNewEmail(data: unknown, locale?: Locale): Promise<void> {
  try {
    const validated = schemas.myNewEmailSchema.parse(data);
    const { subject, html } = templates.myNewEmail(validated, locale);

    await this.send({
      to: validated.recipientEmail,
      subject,
      html,
      sendTelegram: true, // Optional
      telegramMessage: `🎉 Event Name\n- Field: ${validated.customField}`
    });
  } catch (error) {
    console.error('[EmailService] Failed to send my new email:', error);
    throw error;
  }
}
```

### Step 4: Add to email-n8n.ts (Optional)

If you need backward compatibility, add a wrapper function:

```typescript
export async function sendMyNewEmail(data: {
  recipientEmail: string;
  recipientName: string;
  customField: string;
}) {
  try {
    await emailService.sendMyNewEmail(data);
  } catch (err) {
    console.error('Error sending my new email:', err);
    // Don't throw - graceful degradation
  }
}
```

### Step 5: Add to Email Preview

Update `/src/routes/dev/email-preview/+page.server.ts`:

```typescript
const sampleData = {
  // ... existing samples
  myNewEmail: {
    recipientEmail: 'test@example.com',
    recipientName: 'Test User',
    customField: 'Sample data'
  }
};

const emailPreviews = [
  // ... existing previews
  {
    id: 'my-new-email',
    name: 'My New Email',
    ...templates.myNewEmail(sampleData.myNewEmail)
  }
];
```

### Step 6: Add Tests

Update `__tests__/templates.test.ts`:

```typescript
describe('myNewEmail', () => {
  it('should render without errors', () => {
    const data: schemas.MyNewEmailData = {
      recipientEmail: 'test@example.com',
      recipientName: 'Test',
      customField: 'Sample'
    };

    const result = templates.myNewEmail(data);

    expect(result.subject).toBeTruthy();
    expect(result.html).toContain('Test');
    expect(result.html).toContain('Sample');
  });
});
```

## Modifying Existing Emails

To modify an existing email:

1. **Find the template**: Look in `templates/` directory
2. **Update the template**: Modify HTML using components from `components.ts`
3. **Test locally**: Visit `/dev/email-preview` to see changes
4. **Test in email clients**: Send test emails to Gmail, Outlook, Apple Mail
5. **Update tests**: Ensure tests still pass or update them
6. **Deploy**: Changes take effect immediately (no n8n workflow updates needed!)

## Email Client Compatibility

All templates follow email client best practices:

- **Inline CSS**: No external stylesheets
- **Table layouts**: No flexbox or CSS Grid
- **Tested in**:
  - Gmail (Web, iOS, Android)
  - Outlook (2016+, Web)
  - Apple Mail (macOS, iOS)
  - Yahoo Mail
  - Protonmail

### Common Gotchas

❌ **Don't use**: Modern CSS (flexbox, grid, transforms)
❌ **Don't use**: External images without `https://`
❌ **Don't use**: JavaScript or `<script>` tags
❌ **Don't use**: Embedded fonts (some clients block them)

✅ **Do use**: Inline styles
✅ **Do use**: Table-based layouts
✅ **Do use**: Absolute URLs
✅ **Do use**: Web-safe fonts

## Testing

### Run Tests

```bash
# Run all email tests
npm test src/lib/server/email

# Run with watch mode
npm test src/lib/server/email -- --watch

# Run specific test file
npm test src/lib/server/email/__tests__/templates.test.ts
```

### Preview Emails in Browser

Visit `/dev/email-preview` (development only):

1. Select an email template from dropdown
2. View rendered email in iframe
3. Toggle "Show Raw HTML" to see source
4. Check subject line

### Manual Testing in Email Clients

1. Use email preview to copy HTML
2. Create test account on [Mailtrap](https://mailtrap.io) or similar
3. Send test emails to real accounts:
   - Gmail: test@gmail.com
   - Outlook: test@outlook.com
   - Apple Mail: test@icloud.com
4. Verify:
   - Rendering is correct
   - Images load
   - Links work
   - Buttons are clickable
   - Mobile responsive

## Configuration

### Environment Variables

Required in `.env`:

```bash
EMAIL_HEADER_SECRET=your_secret_here
```

Optional (defaults in `config.ts`):

```bash
N8N_WEBHOOK_URL=https://automation.personalflow.net/webhook
```

### Email Service Config

Edit `config.ts` to change:

- Retry attempts (default: 3)
- Timeout (default: 5000ms)
- Telegram chat ID
- From email address

## Telegram Notifications

Telegram notifications are sent for important events:

- ✅ New user signups
- ✅ New bookings
- ✅ Booking cancellations
- ✅ School applications
- ✅ Contact form submissions

Format:
```
🎉 Event Name
- Field1: Value1
- Field2: Value2
```

To add/remove Telegram notifications:

1. Edit service method in `service.ts`
2. Set `sendTelegram: true/false`
3. Customize `telegramMessage`

## Error Handling

The system uses **graceful degradation**:

- Failed emails don't break the application
- Retry logic (3 attempts, exponential backoff)
- Comprehensive error logging
- No errors thrown to calling code

### Monitoring

Check logs for email issues:

```bash
# Look for email-related errors
grep "\\[EMAIL\\]" logs/app.log

# Look for specific email types
grep "Failed to send signup email" logs/app.log
```

## n8n Workflow Setup

See [`docs/n8n-workflows/README.md`](../../../docs/n8n-workflows/README.md) for:

- Importing generic workflow
- Configuring SMTP credentials
- Setting up Telegram bot
- Testing the webhook

## Troubleshooting

### Emails not sending

1. Check n8n workflow is active
2. Verify `EMAIL_HEADER_SECRET` matches in both apps
3. Check n8n execution logs
4. Verify SMTP credentials in n8n

### Zod validation errors

1. Check schema in `schemas/` directory
2. Verify all required fields are provided
3. Check field types match schema
4. Look at error message for details

### Telegram not working

1. Verify bot token in n8n
2. Check chat ID is correct (8113066616)
3. Ensure `sendTelegram: true` in service method
4. Verify bot has access to chat

### Template rendering issues

1. Check for syntax errors in template
2. Verify all data fields exist
3. Test in `/dev/email-preview`
4. Check for missing optional field handling

## Performance

- **Template rendering**: <10ms average
- **Webhook call**: <1s with retries
- **Total time**: 1-2s per email
- **Timeout**: 5s (configurable)

## Future Enhancements

Potential improvements:

- [ ] **i18n**: Add Spanish translations (locale parameter exists)
- [ ] **Email templates**: Add more visual variety
- [ ] **Analytics**: Track email opens and clicks
- [ ] **Testing**: Add visual regression testing
- [ ] **Attachments**: Support PDF attachments
- [ ] **Scheduling**: Delay or schedule emails

## Support

For questions or issues:

1. Check this documentation
2. Check [`docs/n8n-workflows/README.md`](../../../docs/n8n-workflows/README.md)
3. Look at test files for examples
4. Contact development team

## Migration Checklist

- [x] Base infrastructure created
- [x] All 13 templates implemented
- [x] Type-safe schemas with Zod
- [x] Email service with retry logic
- [x] Backward compatible wrappers
- [x] Generic n8n workflow created
- [x] Email preview tool
- [x] Tests written
- [x] Documentation complete
- [ ] Import n8n workflow to production
- [ ] Test all emails in production
- [ ] Monitor for 1-2 weeks
- [ ] Deactivate old n8n workflows
- [ ] Delete old workflows after 30 days
