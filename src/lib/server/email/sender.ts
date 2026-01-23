/**
 * Email sender with retry logic and error handling
 */

import { emailConfig } from './config';
import type { N8NPayload } from './types';

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send email via n8n webhook with retry logic and timeout
 */
export async function sendViaWebhook(payload: N8NPayload): Promise<void> {
	const url = `${emailConfig.n8nWebhookUrl}${emailConfig.n8nWebhookPath}`;
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= emailConfig.retryAttempts; attempt++) {
		try {
			// Create abort controller for timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), emailConfig.timeoutMs);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-n8n-secret': emailConfig.n8nSecret
				},
				body: JSON.stringify(payload),
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`n8n webhook returned ${response.status}: ${errorText || 'Unknown error'}`
				);
			}

			// Success!
			console.log(`[EMAIL] Successfully sent email to ${payload.email}`);
			if (payload.sendTelegram) {
				console.log(`[EMAIL] Telegram notification enabled for ${payload.email}`);
			}
			return;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Check if it's a timeout error
			if (lastError.name === 'AbortError') {
				console.error(
					`[EMAIL] Attempt ${attempt}/${emailConfig.retryAttempts} - Timeout after ${emailConfig.timeoutMs}ms for ${payload.email}`
				);
			} else {
				console.error(
					`[EMAIL] Attempt ${attempt}/${emailConfig.retryAttempts} - Error sending email to ${payload.email}:`,
					lastError.message
				);
			}

			// If this wasn't the last attempt, wait before retrying (exponential backoff)
			if (attempt < emailConfig.retryAttempts) {
				const delayMs = emailConfig.retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
				console.log(`[EMAIL] Retrying in ${delayMs}ms...`);
				await sleep(delayMs);
			}
		}
	}

	// All retries failed - log error but don't throw (graceful degradation)
	console.error(
		`[EMAIL] Failed to send email to ${payload.email} after ${emailConfig.retryAttempts} attempts:`,
		lastError?.message || 'Unknown error'
	);
	console.error('[EMAIL] Email payload:', {
		to: payload.email,
		subject: payload.subject,
		sendTelegram: payload.sendTelegram
	});

	// Don't throw - we want to gracefully degrade
	// The application should continue working even if emails fail
}
