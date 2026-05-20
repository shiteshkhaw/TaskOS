import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/errors/error-handler';
import { checkRateLimit } from '@/core/middleware/rate-limit';
import { GoogleAuthService } from '@/domains/auth/google-auth.service';
import { logger } from '@/core/logger/logger';
import { ValidationError } from '@/core/errors/custom-errors';

export const POST = withErrorHandler(async (req: NextRequest) => {
    // 1. Strict Rate Limiting on Auth
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await checkRateLimit(ip, 5, 60000); // Max 5 logins per minute

    // 2. Parse Body
    const body = await req.json().catch(() => null);
    if (!body || !body.idToken) {
        throw new ValidationError('idToken is required');
    }

    logger.info('Received Google OAuth login request');

    // 3. Authenticate
    const result = await GoogleAuthService.authenticate(body.idToken);

    // 4. Return secure JWT to client and set HTTP-only cookie
    const response = NextResponse.json({
        success: true,
        data: result
    });

    response.cookies.set('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
});
