// CREATE: src/routes/api/auth/signup/+server.ts

import { json, type RequestHandler } from '@sveltejs/kit';
import { UserService } from '$src/features/Users/lib/UserService';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$src/lib/server/session';
import { sendSignupEmail } from '$src/lib/server/webhooks/email-n8n';

const userService = new UserService();

export const POST: RequestHandler = async (event) => {
    try {
        const { name, lastName, email, password } = await event.request.json();

        // Validate input
        if (!name || !lastName || !email || !password) {
            return json({ message: 'All fields are required' }, { status: 400 });
        }

        if (password.length < 8) {
            return json({ message: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // Check if email exists
        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
            return json({ message: 'Email already registered' }, { status: 409 });
        }

        // Create user
        const newUser = await userService.createUserWithPassword({
            name,
            lastName,
            email,
            password
        });

        // Send welcome email
        try {
            await sendSignupEmail(newUser.name, newUser.email);
        } catch (emailError) {
            console.error('Failed to send signup email:', emailError);
            // Don't fail the signup if email fails
        }

        // Create session
        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, newUser.id);
        setSessionTokenCookie(event, sessionToken, session.expiresAt);

        return json({ 
            success: true, 
            user: { id: newUser.id, name: newUser.name, email: newUser.email } 
        });
    } catch (error) {
        console.error('Signup error:', error);
        return json({ message: 'An error occurred during signup' }, { status: 500 });
    }
};