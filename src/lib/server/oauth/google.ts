import 'dotenv/config'
import { Google } from "arctic";

let callbackUrl: string;

if(process.env.NODE_ENV === "production") {
	callbackUrl = `${process.env.PROJECT_URL}/google/callback`
} else {
	callbackUrl = `http://localhost:5173/google/callback`
}
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

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