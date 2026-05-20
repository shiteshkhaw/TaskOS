import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface ProfileParams {
    params: Promise<{ email: string }>;
}

/**
 * GET /api/auth/profile/[email]
 * Get user profile by email
 */
export async function GET(request: NextRequest, { params }: ProfileParams) {
    try {
        const { email } = await params;
        const decodedEmail = decodeURIComponent(email);

        const user = await prisma.user.findUnique({
            where: { email: decodedEmail },
        });

        if (!user) {
            return notFoundResponse('User not found');
        }

        return successResponse({
            email: user.email,
            username: user.username,
            is_pro: user.isPro,
            avatar_url: user.avatarUrl,
            created_at: user.createdAt?.toISOString() || null,
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return serverErrorResponse(`Failed to get profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * PUT /api/auth/profile/[email]
 * Update user profile
 */
export async function PUT(request: NextRequest, { params }: ProfileParams) {
    try {
        const { email } = await params;
        const decodedEmail = decodeURIComponent(email);
        const body = await request.json();

        const user = await prisma.user.findUnique({
            where: { email: decodedEmail },
        });

        if (!user) {
            return notFoundResponse('User not found');
        }

        // Update fields if provided
        const updateData: { username?: string; avatarUrl?: string } = {};

        if (body.username !== undefined) {
            updateData.username = body.username;
        }

        if (body.avatar !== undefined) {
            updateData.avatarUrl = body.avatar;
        }

        const updatedUser = await prisma.user.update({
            where: { email: decodedEmail },
            data: updateData,
        });

        return successResponse({
            success: true,
            message: 'Profile updated successfully',
            user: {
                email: updatedUser.email,
                username: updatedUser.username,
                avatar_url: updatedUser.avatarUrl,
            },
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return serverErrorResponse(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
