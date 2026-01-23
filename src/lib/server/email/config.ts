/**
 * Email service configuration
 */

import { EMAIL_HEADER_SECRET } from '$lib/server/config';

export const emailConfig = {
	// n8n webhook configuration
	n8nWebhookUrl: 'https://automation.personalflow.net/webhook',
	n8nWebhookPath: '/send-email',
	n8nSecret: EMAIL_HEADER_SECRET,

	// Email sender info
	fromEmail: 'Local Snow <admin@localsnow.org>',
	fromName: 'Local Snow',

	// Telegram notification configuration
	telegramChatId: '8113066616',

	// Retry configuration
	retryAttempts: 3,
	retryDelayMs: 1000, // Initial delay, will be multiplied by attempt number (exponential backoff)

	// Timeout configuration
	timeoutMs: 5000
} as const;
