import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface NotificationParams {
    params: Promise<{ id: string }>;
}

/**
 * PUT /api/notifications/[id]/read
 * Mark a notification as read
 */
export async function PUT(request: NextRequest, { params }: NotificationParams) {
    try {
        const { id } = await params;

        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return notFoundResponse('Notification not found');
        }

        await prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return successResponse({
            success: true,
            message: 'Notification marked as read',
        });

    } catch (error) {
        console.error('Mark read error:', error);
        return serverErrorResponse(`Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * PATCH /api/notifications/[id]/read
 */
export async function PATCH(request: NextRequest, context: NotificationParams) {
    return PUT(request, context);
}

