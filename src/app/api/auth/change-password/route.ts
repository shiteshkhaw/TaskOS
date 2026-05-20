import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

interface ChangePasswordRequest {
    email: string;
    current_password: string;
    new_password: string;
}

/**
 * POST /api/auth/change-password
 * Change user password
 */
export async function POST(request: NextRequest) {
    try {
        const body: ChangePasswordRequest = await request.json();
        const { email, current_password, new_password } = body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return notFoundResponse('User not found');
        }

        if (!user.passwordHash) {
            return errorResponse('No password set for this account', 400);
        }

        // Verify current password
        const isValid = await verifyPassword(current_password, user.passwordHash);
        if (!isValid) {
            return unauthorizedResponse('Current password is incorrect');
        }

        // Validate new password
        if (new_password.length < 6) {
            return errorResponse('New password must be at least 6 characters long', 400);
        }

        // Update password
        const newHash = await hashPassword(new_password);
        await prisma.user.update({
            where: { email },
            data: { passwordHash: newHash },
        });

        return successResponse({
            success: true,
            message: 'Password changed successfully',
        });

    } catch (error) {
        console.error('Change password error:', error);
        return serverErrorResponse(`Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
