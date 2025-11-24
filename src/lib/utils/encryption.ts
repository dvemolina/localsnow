import { CALENDAR_TOKEN_ENCRYPTION_KEY } from '$lib/server/config';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Derive key from password using PBKDF2
function deriveKey(password: string, salt: Buffer): Buffer {
	return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data (OAuth tokens)
 */
export function encrypt(text: string): string {
	const salt = crypto.randomBytes(SALT_LENGTH);
	const key = deriveKey(CALENDAR_TOKEN_ENCRYPTION_KEY, salt);
	const iv = crypto.randomBytes(IV_LENGTH);
	
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
	const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	
	// Format: salt:iv:tag:encrypted
	return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt sensitive data (OAuth tokens)
 */
export function decrypt(encryptedData: string): string {
	const buffer = Buffer.from(encryptedData, 'base64');
	
	const salt = buffer.subarray(0, SALT_LENGTH);
	const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
	const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
	const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
	
	const key = deriveKey(CALENDAR_TOKEN_ENCRYPTION_KEY, salt);
	
	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);
	
	return decipher.update(encrypted) + decipher.final('utf8');
}

/**
 * Validate encryption key exists
 */
export function validateEncryptionKey(): void {
	if (!CALENDAR_TOKEN_ENCRYPTION_KEY || CALENDAR_TOKEN_ENCRYPTION_KEY.length < 32) {
		throw new Error('CALENDAR_TOKEN_ENCRYPTION_KEY must be at least 32 characters');
	}
}