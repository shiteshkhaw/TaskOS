import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface DeleteAccountRequest {
    email: string;
    password: string;
}

/**
 * POST /api/auth/delete-account
 * Delete user account and all associated data
 */
export async function POST(request: NextRequest) {
    try {
        const body: DeleteAccountRequest = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return errorResponse('Email and password are required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.passwordHash) {
            return notFoundResponse('User not found');
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return unauthorizedResponse('Invalid password');
        }

        // Delete all user data in order of dependencies
        // Using transaction for atomicity
        await prisma.$transaction(async (tx) => {
            // Delete notifications
            await tx.notification.deleteMany({
                where: { userEmail: email },
            });

            // Delete push subscriptions
            await tx.pushSubscription.deleteMany({
                where: { userEmail: email },
            });

            // Delete password reset tokens
            await tx.passwordResetToken.deleteMany({
                where: { userEmail: email },
            });

            // Delete streak
            await tx.streak.deleteMany({
                where: { userEmail: email },
            });

            // Delete planner events
            await tx.plannerEvent.deleteMany({
                where: { userEmail: email },
            });

            // Delete habits
            await tx.habit.deleteMany({
                where: { userEmail: email },
            });

            // Delete tasks (including group tasks)
            await tx.task.deleteMany({
                where: { userEmail: email },
            });

            // Delete created groups (cascade will delete related tasks)
            await tx.group.deleteMany({
                where: { createdBy: email },
            });

            // Remove user from group members
            const memberGroups = await tx.group.findMany({
                where: { members: { has: email } },
            });

            for (const group of memberGroups) {
                await tx.group.update({
                    where: { id: group.id },
                    data: {
                        members: group.members.filter((m: string) => m !== email),
                    },
                });
            }

            // Finally delete the user
            await tx.user.delete({
                where: { email },
            });
        });

        return successResponse({
            message: 'Account deleted successfully',
        });

    } catch (error) {
        console.error('Delete account error:', error);
        return serverErrorResponse(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
