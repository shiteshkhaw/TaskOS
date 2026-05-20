import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { successResponse, serverErrorResponse } from '@/lib/api-response';
import { v4 as uuidv4 } from 'uuid';

interface ForgotPasswordRequest {
    email: string;
}

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
export async function POST(request: NextRequest) {
    try {
        const body: ForgotPasswordRequest = await request.json();
        const { email } = body;

        // Check if user exists (don't reveal if email exists for security)
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return success anyway for security (don't reveal if email exists)
            return successResponse({
                success: true,
                message: 'If the email exists, a reset link has been sent',
            });
        }

        // Generate secure reset token
        const resetToken = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Create password reset token record
        await prisma.passwordResetToken.create({
            data: {
                userEmail: email,
                token: resetToken,
                expiresAt,
                used: false,
            },
        });

        // Send reset email
        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            // Don't fail the request if email fails
        }

        return successResponse({
            success: true,
            message: 'If the email exists, a reset link has been sent',
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return serverErrorResponse(`Failed to process reset request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
