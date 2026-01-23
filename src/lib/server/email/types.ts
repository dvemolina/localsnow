/**
 * Core type definitions for the email service
 */

export type Locale = 'en' | 'es';

/**
 * Email template function signature
 * All templates must implement this interface
 */
export interface EmailTemplate<T> {
	(data: T, locale?: Locale): EmailResult;
}

/**
 * Result returned by template functions
 */
export interface EmailResult {
	subject: string;
	html: string;
}

/**
 * Options for sending an email
 */
export interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	sendTelegram?: boolean;
	telegramMessage?: string;
}

/**
 * Payload sent to n8n webhook
 */
export interface N8NPayload {
	email: string;
	subject: string;
	html: string;
	sendTelegram?: boolean;
	telegramMessage?: string;
}
