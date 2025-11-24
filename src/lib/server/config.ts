import fs from 'fs';

/**
 * 
 * Reading priority:
 * 1. Docker Secret file (production) - /run/secrets/secret_name
 * 2. Environment variable with _FILE suffix pointing to secret file
 * 3. Direct environment variable (development)
 * 4. Default value
 */

function getSecret(name: string, defaultValue: string = ''): string {
	// Check for _FILE environment variable (Docker Secrets pattern)
	const filePathEnv = process.env[`${name}_FILE`];
	
	if (filePathEnv) {
		try {
			const content = fs.readFileSync(filePathEnv, 'utf-8').trim();
			if (content) {
				return content;
			}
			console.warn(`Secret file ${filePathEnv} is empty, falling back to env var`);
		} catch (err) {
			console.error(`Failed to read secret file ${filePathEnv}:`, err);
			// Fall through to direct env var
		}
	}

	// Fallback to direct environment variable
	const envValue = process.env[name];
	if (envValue) {
		return envValue;
	}

	// Use default value
	if (defaultValue) {
		return defaultValue;
	}

	// No value found - log warning but don't crash (let the app fail gracefully later)
	console.warn(`Configuration value ${name} not found (no file, no env var, no default)`);
	return '';
}

// =============================================================================
// REQUIRED CONFIGURATION
// =============================================================================

// Database
export const DATABASE_URL = getSecret('DATABASE_URL');

// Stripe Payment
export const STRIPE_SECRET_KEY = getSecret('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET = getSecret('STRIPE_WEBHOOK_SECRET');

// Google OAuth
export const GOOGLE_CLIENT_ID = getSecret('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = getSecret('GOOGLE_CLIENT_SECRET');

// Cloudflare R2 Storage
export const R2_ACCOUNT_ID = getSecret('R2_ACCOUNT_ID');
export const R2_ACCESS_KEY_ID = getSecret('R2_ACCESS_KEY_ID');
export const R2_SECRET_ACCESS_KEY = getSecret('R2_SECRET_ACCESS_KEY');
export const R2_BUCKET_NAME = getSecret('R2_BUCKET_NAME', 'localsnow-uploads');
export const R2_PUBLIC_URL = getSecret('R2_PUBLIC_URL');

// Cron Job Authentication
export const CRON_SECRET = getSecret('CRON_SECRET');

// =============================================================================
// OPTIONAL CONFIGURATION
// =============================================================================

export const SENTRY_DSN = getSecret('SENTRY_DSN', '');
export const GA_MEASUREMENT_ID = getSecret('GA_MEASUREMENT_ID', '');

// =============================================================================
// PUBLIC CONFIGURATION (not sensitive)
// =============================================================================

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PROJECT_URL = process.env.PROJECT_URL || 'http://localhost:5173';

// =============================================================================
// VALIDATION (optional but recommended)
// =============================================================================

/**
 * Validate that all required secrets are present
 * Call this on app startup to fail fast if configuration is missing
 */
export function validateConfig(): { valid: boolean; missing: string[] } {
	const required = [
		{ name: 'DATABASE_URL', value: DATABASE_URL },
		{ name: 'STRIPE_SECRET_KEY', value: STRIPE_SECRET_KEY },
		{ name: 'STRIPE_WEBHOOK_SECRET', value: STRIPE_WEBHOOK_SECRET },
		{ name: 'GOOGLE_CLIENT_ID', value: GOOGLE_CLIENT_ID },
		{ name: 'GOOGLE_CLIENT_SECRET', value: GOOGLE_CLIENT_SECRET },
		{ name: 'R2_ACCOUNT_ID', value: R2_ACCOUNT_ID },
		{ name: 'R2_ACCESS_KEY_ID', value: R2_ACCESS_KEY_ID },
		{ name: 'R2_SECRET_ACCESS_KEY', value: R2_SECRET_ACCESS_KEY },
		{ name: 'R2_PUBLIC_URL', value: R2_PUBLIC_URL },
		{ name: 'CRON_SECRET', value: CRON_SECRET }
	];

	const missing = required
		.filter(({ value }) => !value)
		.map(({ name }) => name);

	return {
		valid: missing.length === 0,
		missing
	};
}