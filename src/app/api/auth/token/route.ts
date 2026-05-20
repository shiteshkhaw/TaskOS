import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

/**
 * POST /api/auth/token
 * OAuth2 compatible token endpoint
 * Accepts form data with username (email) and password
 */
export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || '';

        let email: string;
        let password: string;

        // Support both form data and JSON
        if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            email = formData.get('username') as string; // OAuth2 uses 'username' field
            password = formData.get('password') as string;
        } else {
            const body = await request.json();
            email = body.username || body.email;
            password = body.password;
        }

        if (!email || !password) {
            return errorResponse('Username and password are required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.passwordHash) {
            return unauthorizedResponse('Invalid credentials');
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return unauthorizedResponse('Invalid credentials');
        }

        // Generate JWT token
        const accessToken = generateToken({
            email: user.email,
            username: user.username || undefined
        });

        // OAuth2 compatible response
        return successResponse({
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: 86400, // 24 hours
            user: {
                email: user.email,
                username: user.username,
                is_pro: user.isPro,
                avatar_url: user.avatarUrl,
            },
        });

    } catch (error) {
        console.error('Token error:', error);
        return errorResponse(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
}
