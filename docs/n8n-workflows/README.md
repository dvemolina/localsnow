# N8N Email Workflow Setup

This directory contains the generic email workflow for Local Snow.

## Generic Email Workflow

The `GENERIC-EMAIL-WORKFLOW.json` is a single, unified workflow that replaces all 13+ individual email workflows.

### Features

- **Single endpoint**: `/send-email` handles all email types
- **Authentication**: Validates `x-n8n-secret` header
- **Email sending**: Sends HTML emails via SMTP
- **Telegram notifications**: Optional Telegram alerts for important events
- **Error handling**: Returns appropriate HTTP status codes

### Setup Instructions

1. **Import the workflow to n8n**:
   - Open your n8n instance (https://automation.personalflow.net)
   - Go to Workflows → Import from File
   - Select `GENERIC-EMAIL-WORKFLOW.json`

2. **Configure credentials**:
   - **SMTP Account**: Add your email server credentials
     - Host: Your SMTP server
     - Port: 587 (or your SMTP port)
     - Username: admin@localsnow.org
     - Password: Your SMTP password
   - **Telegram API**: Add your Telegram bot credentials
     - API Token: Your bot token from @BotFather
     - Chat ID: 8113066616 (already configured in workflow)

3. **Set environment variable**:
   - In n8n settings, add `EMAIL_HEADER_SECRET` environment variable
   - This should match the `EMAIL_HEADER_SECRET` in your SvelteKit app

4. **Activate the workflow**:
   - Click "Active" toggle to enable the workflow
   - The webhook will be available at: `https://automation.personalflow.net/webhook/send-email`

### Testing

Test the workflow with curl:

\`\`\`bash
curl -X POST https://automation.personalflow.net/webhook/send-email \\
  -H "Content-Type: application/json" \\
  -H "x-n8n-secret: YOUR_SECRET_HERE" \\
  -d '{
    "email": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello World</h1><p>This is a test email.</p>",
    "sendTelegram": true,
    "telegramMessage": "🧪 Test email sent to test@example.com"
  }'
\`\`\`

Expected response:
\`\`\`json
{
  "success": true,
  "message": "Email sent successfully"
}
\`\`\`

### Request Format

All email requests should use this format:

\`\`\`json
{
  "email": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<html>...</html>",
  "sendTelegram": false,
  "telegramMessage": "Optional Telegram notification text"
}
\`\`\`

### Migration from Old Workflows

Once this generic workflow is active and tested:

1. Verify all email types work correctly
2. Monitor logs for any issues
3. After 1-2 weeks of successful operation, deactivate old workflows:
   - `/797b1c35-f0fd-4b8c-a0a2-014d07e396ae` (signup)
   - `/booking-notification-instructor`
   - `/booking-confirmation-client`
   - `/booking-contact-info`
   - `/booking-cancellation-instructor`
   - `/booking-cancellation-client`
   - `/school-instructor-invitation`
   - `/school-application`
   - `/school-instructor-accepted`
   - `/school-instructor-rejected`
   - `/school-invitation-accepted`
   - `/school-instructor-deactivated`
   - `/instructor-contact-form`

4. Keep old workflows for 30 days as backup before deleting

### Troubleshooting

**Emails not sending**:
- Check SMTP credentials
- Verify `EMAIL_HEADER_SECRET` matches between n8n and SvelteKit
- Check n8n execution logs

**Telegram notifications not working**:
- Verify Telegram API credentials
- Ensure bot has access to chat ID 8113066616
- Check that `sendTelegram: true` is set in request

**403 Unauthorized errors**:
- Verify `x-n8n-secret` header is included in request
- Check that `EMAIL_HEADER_SECRET` environment variable is set correctly in n8n

### Support

For issues or questions, contact the development team or check the n8n documentation at https://docs.n8n.io
