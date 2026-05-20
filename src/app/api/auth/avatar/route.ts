import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadAvatar, deleteAvatar, isS3Configured } from '@/lib/s3';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * POST /api/auth/avatar
 * Upload user avatar to S3
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const file = formData.get('file') as File;

        if (!email || !file) {
            return errorResponse('Email and file are required', 400);
        }

        // Check if S3 is configured
        if (!isS3Configured()) {
            return errorResponse('S3 storage is not configured', 503);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return notFoundResponse('User not found');
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to S3
        const result = await uploadAvatar(email, buffer, file.type, file.name);

        if (!result.success) {
            return errorResponse(result.error || 'Upload failed', 400);
        }

        // Delete old avatar if exists
        if (user.avatarUrl) {
            await deleteAvatar(user.avatarUrl);
        }

        // Update user with new avatar URL
        await prisma.user.update({
            where: { email },
            data: { avatarUrl: result.url },
        });

        return successResponse({
            message: 'Avatar uploaded successfully',
            avatar_url: result.url,
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        return serverErrorResponse(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * DELETE /api/auth/avatar
 * Delete user avatar from S3
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return errorResponse('Email parameter is required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return notFoundResponse('User not found');
        }

        if (!user.avatarUrl) {
            return errorResponse('User has no avatar', 400);
        }

        // Delete from S3
        const deleted = await deleteAvatar(user.avatarUrl);

        if (!deleted) {
            console.warn('Failed to delete avatar from S3, but continuing...');
        }

        // Clear avatar URL in database
        await prisma.user.update({
            where: { email },
            data: { avatarUrl: null },
        });

        return successResponse({
            message: 'Avatar deleted successfully',
        });

    } catch (error) {
        console.error('Avatar delete error:', error);
        return serverErrorResponse(`Failed to delete avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
