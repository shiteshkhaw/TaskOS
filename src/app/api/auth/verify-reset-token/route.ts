import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

interface VerifyTokenRequest {
    token: string;
}

/**
 * POST /api/auth/verify-reset-token
 * Verify if a reset token is valid
 */
export async function POST(request: NextRequest) {
    try {
        const body: VerifyTokenRequest = await request.json();
        const { token } = body;

        const tokenRecord = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!tokenRecord) {
            return successResponse({
                valid: false,
                message: 'Invalid reset token',
            });
        }

        if (tokenRecord.used) {
            return successResponse({
                valid: false,
                message: 'This reset link has already been used',
            });
        }

        if (new Date() > tokenRecord.expiresAt) {
            return successResponse({
                valid: false,
                message: 'This reset link has expired. Please request a new one.',
            });
        }

        return successResponse({
            valid: true,
            message: 'Token is valid',
            email: tokenRecord.userEmail,
        });

    } catch (error) {
        console.error('Verify token error:', error);
        return errorResponse(`Failed to verify token: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
}
