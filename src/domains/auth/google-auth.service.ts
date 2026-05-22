import { UnauthorizedError } from '@/core/errors/custom-errors';
import { logger } from '@/core/logger/logger';
import { generateToken } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from './user.repository';

// ⚠️  Do NOT instantiate OAuth2Client at module level.
//     Next.js loads env vars after module evaluation during cold starts,
//     so process.env.GOOGLE_CLIENT_ID would read as undefined and the client
//     would silently fall back to the mock string — causing audience mismatch.
//     Always construct the client lazily inside the method.

export class GoogleAuthService {
    /**
     * Verify the Google ID Token sent from the frontend using official library
     */
    static async verifyGoogleToken(idToken: string) {
        // Lazy-read the client ID so env vars are fully loaded at call time
        const clientId =
            process.env.GOOGLE_CLIENT_ID ||
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId) {
            throw new UnauthorizedError(
                'Google OAuth is not configured: set GOOGLE_CLIENT_ID in your .env'
            );
        }

        // Mock bypass for local dev without real GCP credentials
        if (idToken.startsWith('mock_')) {
            logger.warn('[GoogleAuthService] Using mock token bypass (dev only)');
            return {
                email: 'google-user@example.com',
                name: 'Google User',
                picture: 'https://lh3.googleusercontent.com/a/default-user',
            };
        }

        try {
            const client = new OAuth2Client(clientId);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: clientId,
            });

            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                throw new UnauthorizedError('Invalid Google token: missing payload');
            }

            return {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            };
        } catch (error: any) {
            // Log the real reason so it appears in the server console
            logger.error('[GoogleAuthService] Token verification failed', {
                reason: error?.message ?? error,
                stack: error?.stack,
            });
            throw new UnauthorizedError(
                `Google token verification failed: ${error?.message ?? 'unknown error'}`
            );
        }
    }

    /**
     * Authenticate via Google
     */
    static async authenticate(idToken: string) {
        const payload = await this.verifyGoogleToken(idToken);
        const email = payload.email!;

        // 1. Fetch user from DB, Create if not exists (upsert properly)
        await UserRepository.upsert({
            email,
            name: payload.name,
            avatar: payload.picture,
        });

        logger.info(`[GoogleAuthService] Authenticated user ${email}`);

        // 2. Generate JWT Session Token
        const jwtToken = generateToken({ email, username: payload.name });

        return {
            token: jwtToken,
            user: {
                email,
                name: payload.name,
                picture: payload.picture,
            }
        };
    }
}
