import { UnauthorizedError } from '@/core/errors/custom-errors';
import { logger } from '@/core/logger/logger';
import { generateToken } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from './user.repository';

// Use a fallback for development if GOOGLE_CLIENT_ID is not set in env yet
const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-client-id-for-development';
const client = new OAuth2Client(clientId);

export class GoogleAuthService {
    /**
     * Verify the Google ID Token sent from the frontend using official library
     */
    static async verifyGoogleToken(idToken: string) {
        try {
            // Check if we are running in a mock dev environment without real Google integration
            if (clientId === 'mock-client-id-for-development' && idToken.startsWith('mock_')) {
                return {
                    email: 'google-user@example.com',
                    name: 'Google User',
                    picture: 'https://avatar.google.com/example',
                };
            }

            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: clientId,
            });

            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                throw new UnauthorizedError('Invalid Google token');
            }

            return {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            };
        } catch (error) {
            logger.error('[GoogleAuthService] Token verification failed', { error });
            throw new UnauthorizedError('Google Authentication Failed');
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
