// UPDATE: src/routes/(auth)/oauth/google/+server.ts

import { generateState, generateCodeVerifier } from "arctic";
import { google } from "$lib/server/oauth/google";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const scopes = ["openid", "profile", "email"];
	const url = google.createAuthorizationURL(state, codeVerifier, scopes);

	// ADD THIS: Store the referrer/current page to redirect back after OAuth
	const returnTo = event.url.searchParams.get('returnTo') || event.request.headers.get('referer') || '/';
	
	event.cookies.set("google_oauth_state", state, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});
	event.cookies.set("google_code_verifier", codeVerifier, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});
	
	// ADD THIS: Store where to redirect after OAuth
	event.cookies.set("oauth_return_to", returnTo, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}