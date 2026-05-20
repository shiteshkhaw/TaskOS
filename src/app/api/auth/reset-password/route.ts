import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface ResetPasswordRequest {
    token: string;
    new_password: string;
}

/**
 * POST /api/auth/reset-password
 * Reset password using valid token
 */
export async function POST(request: NextRequest) {
    try {
        const body: ResetPasswordRequest = await request.json();
        const { token, new_password } = body;

        // Find and validate token
        const tokenRecord = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!tokenRecord) {
            return notFoundResponse('Invalid reset token');
        }

        if (tokenRecord.used) {
            return errorResponse('This reset link has already been used', 400);
        }

        if (new Date() > tokenRecord.expiresAt) {
            return errorResponse('This reset link has expired. Please request a new one.', 400);
        }

        // Validate new password
        if (new_password.length < 6) {
            return errorResponse('Password must be at least 6 characters long', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: tokenRecord.userEmail },
        });

        if (!user) {
            console.error(`❌ User not found for email: ${tokenRecord.userEmail}`);
            return notFoundResponse('User not found');
        }

        console.log(`✅ Found user: ${user.email}`);

        // Hash new password with bcrypt
        const newHash = await hashPassword(new_password);
        console.log(`🔑 New password hash generated`);

        // Update password and mark token as used in transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { email: tokenRecord.userEmail },
                data: { passwordHash: newHash },
            }),
            prisma.passwordResetToken.update({
                where: { token },
                data: { used: true },
            }),
        ]);

        console.log(`💾 Committed changes to database`);

        return successResponse({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.',
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return serverErrorResponse(`Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
