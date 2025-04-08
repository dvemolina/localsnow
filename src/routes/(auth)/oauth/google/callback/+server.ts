
import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/auth";
import { google, type GoogleClaims } from "$lib/server/oauth/google";
import { decodeIdToken } from "arctic";
import type { RequestEvent } from "@sveltejs/kit";
import type {  OAuth2Tokens } from "arctic";
import { UserService } from "$src/features/Users/lib/UserService";
import { generateUsernameFromGoogle } from "$src/lib/utils/generics";


const userService = new UserService()

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get("google_oauth_state") ?? null;
	const codeVerifier = event.cookies.get("google_code_verifier") ?? null;

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		console.error("OAuth Token Exchange Error:", e);
  		return new Response("OAuth Token Exchange Failed", { status: 400 });
	}
	const claims: GoogleClaims = decodeIdToken(tokens.idToken());
	const username = generateUsernameFromGoogle(claims);

	const googleUser = {googleId: claims.sub,  name: claims.given_name, username: username, surname: claims.family_name ? clearImmediate.family_name : "", email: claims.email, profileImage: claims.picture}

	// TODO: Replace this with your own DB query.
	const existingUser = await userService.getUserByGoogleId(googleUser.googleId);

	if (existingUser !== null) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/dashboard"
			}
		});
	}

	const userWithEmail = await userService.getUserByEmail(googleUser.email)
	
	if(userWithEmail) {
		await userService.updateUser(userWithEmail.id, { googleId: googleUser.googleId } );
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, userWithEmail.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}

	const newUser = await userService.createUser(googleUser)
	
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, newUser.id);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	
	return new Response(null, {
		status: 302,
		headers: {
			Location: "/"
		}
	});
}