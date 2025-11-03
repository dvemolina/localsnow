import 'dotenv/config'
import { Google } from "arctic";
import { google as googleApis } from 'googleapis';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { instructorGoogleTokens } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt, encrypt } from '$src/lib/utils/encryption';

// ============================================
// User Authentication OAuth
// ============================================
let callbackUrl: string;

if(process.env.NODE_ENV === "production") {
	callbackUrl = `${process.env.PROJECT_URL}/oauth/google/callback`
} else {
	callbackUrl = `${env.PROJECT_URL}/oauth/google/callback`
}

const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;

export const google = new Google(
	clientId,
	clientSecret,
	callbackUrl
);

export type GoogleUser = {
	googleId: string,
	name: string,
	surname: string,
	email: string,
	profileImage: string
}

export type GoogleClaims = {
	iss: string,
	azp: string,
	aud: string,
	sub: string,
	email: string,
	email_verified: boolean,
	at_hash: string,
	name: string,
	picture: string,
	given_name: string,
	family_name: string,
	iat: number,
	exp: number
}

// ============================================
// Calendar OAuth (separate flow)
// ============================================

const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

let calendarCallbackUrl: string;
if(process.env.NODE_ENV === "production") {
	calendarCallbackUrl = `${process.env.PROJECT_URL}/api/calendar/auth/callback`
} else {
	calendarCallbackUrl = `${env.PROJECT_URL}/api/calendar/auth/callback`
}

/**
 * Get OAuth2 client for Calendar API
 */
export function getCalendarOAuth2Client() {
	return new googleApis.auth.OAuth2(
		clientId,
		clientSecret,
		calendarCallbackUrl
	);
}

/**
 * Generate authorization URL for instructor to connect calendar
 */
export function getCalendarAuthUrl(instructorId: number): string {
	const oauth2Client = getCalendarOAuth2Client();
	
	return oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: CALENDAR_SCOPES,
		state: JSON.stringify({ instructorId }), // Pass instructor ID
		prompt: 'consent' // Force consent to get refresh token
	});
}

/**
 * Exchange authorization code for tokens and store
 */
export async function handleCalendarOAuthCallback(code: string, instructorId: number) {
	const oauth2Client = getCalendarOAuth2Client();
	
	// Exchange code for tokens
	const { tokens } = await oauth2Client.getToken(code);
	
	if (!tokens.access_token || !tokens.refresh_token) {
		throw new Error('Failed to obtain access and refresh tokens');
	}
	
	// Encrypt tokens before storage
	const encryptedAccessToken = encrypt(tokens.access_token);
	const encryptedRefreshToken = encrypt(tokens.refresh_token);
	
	const tokenExpiry = new Date(tokens.expiry_date || Date.now() + 3600 * 1000);
	
	// Upsert tokens (update if exists, insert if new)
	await db.insert(instructorGoogleTokens)
		.values({
			instructorId,
			accessToken: encryptedAccessToken,
			refreshToken: encryptedRefreshToken,
			tokenExpiry,
			syncEnabled: true,
			lastSyncAt: new Date()
		})
		.onConflictDoUpdate({
			target: instructorGoogleTokens.instructorId,
			set: {
				accessToken: encryptedAccessToken,
				refreshToken: encryptedRefreshToken,
				tokenExpiry,
				syncEnabled: true,
				updatedAt: new Date()
			}
		});
	
	return { success: true };
}

/**
 * Get valid OAuth2 client for instructor (auto-refreshes if needed)
 */
export async function getInstructorCalendarClient(instructorId: number) {
	// Use select() instead of db.query
	const tokenDataArray = await db
		.select()
		.from(instructorGoogleTokens)
		.where(eq(instructorGoogleTokens.instructorId, instructorId))
		.limit(1);
	
	const tokenData = tokenDataArray[0];
	
	if (!tokenData) {
		throw new Error('Calendar not connected');
	}
	
	if (!tokenData.syncEnabled) {
		throw new Error('Calendar sync is disabled');
	}
	
	const oauth2Client = getCalendarOAuth2Client();
	
	// Decrypt tokens
	const accessToken = decrypt(tokenData.accessToken);
	const refreshToken = decrypt(tokenData.refreshToken);
	
	oauth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken,
		expiry_date: tokenData.tokenExpiry.getTime()
	});
	
	// Auto-refresh if expired
	if (tokenData.tokenExpiry < new Date()) {
		const { credentials } = await oauth2Client.refreshAccessToken();
		
		// Update stored tokens
		if (credentials.access_token) {
			await db.update(instructorGoogleTokens)
				.set({
					accessToken: encrypt(credentials.access_token),
					tokenExpiry: new Date(credentials.expiry_date || Date.now() + 3600 * 1000),
					updatedAt: new Date()
				})
				.where(eq(instructorGoogleTokens.instructorId, instructorId));
		}
	}
	
	return googleApis.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Disconnect calendar for instructor
 */
export async function disconnectCalendar(instructorId: number) {
	await db.delete(instructorGoogleTokens)
		.where(eq(instructorGoogleTokens.instructorId, instructorId));
	
	return { success: true };
}

/**
 * Check if instructor has calendar connected
 */
export async function isCalendarConnected(instructorId: number): Promise<boolean> {
	// Use select() instead of db.query
	const tokenData = await db
		.select({ id: instructorGoogleTokens.id, syncEnabled: instructorGoogleTokens.syncEnabled })
		.from(instructorGoogleTokens)
		.where(eq(instructorGoogleTokens.instructorId, instructorId))
		.limit(1);
	
	return tokenData.length > 0 && tokenData[0].syncEnabled;
}