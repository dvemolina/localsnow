// CREATE: src/routes/api/auth/login/+server.ts

import { json, type RequestHandler } from '@sveltejs/kit';
import { UserService } from '$src/features/Users/lib/UserService';
import { verifyPasswordHash } from '$src/lib/utils/auth';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$src/lib/server/session';

const userService = new UserService();

export const POST: RequestHandler = async (event) => {
    try {
        const { email, password } = await event.request.json();

        // Validate input
        if (!email || !password) {
            return json({ message: 'Email and password are required' }, { status: 400 });
        }

        // Find user
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // Check if user has password (not Google only)
        if (!user.passwordHash && user.googleId) {
            return json({ message: 'This account uses Google login' }, { status: 400 });
        }

        // Verify password
        if (user.passwordHash) {
            const validPassword = await verifyPasswordHash(password, user.passwordHash);
            if (!validPassword) {
                return json({ message: 'Invalid credentials' }, { status: 401 });
            }
        }

        // Create session
        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, user.id);
        setSessionTokenCookie(event, sessionToken, session.expiresAt);

        return json({ 
            success: true, 
            user: { 
                id: user.id, 
                name: `${user.name} ${user.lastName}`, 
                email: user.email 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        return json({ message: 'An error occurred during login' }, { status: 500 });
    }
};