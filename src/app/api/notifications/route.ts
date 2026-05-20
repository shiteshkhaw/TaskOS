import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * GET /api/notifications
 * List notifications for a user
 * Query params: email (required)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return errorResponse('Email parameter is required', 400);
        }

        const notifications = await prisma.notification.findMany({
            where: { userEmail: email },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to recent 50
        });

        const notificationsData = notifications.map((n) => ({
            id: n.id,
            user_email: n.userEmail,
            notification_type: n.notificationType,
            message: n.message,
            task_id: n.taskId,
            group_id: n.groupId,
            is_read: n.isRead,
            extra_data: n.extraData,
            created_at: n.createdAt?.toISOString() || null,
            read_at: n.readAt?.toISOString() || null,
        }));

        return successResponse(notificationsData);

    } catch (error) {
        console.error('List notifications error:', error);
        return serverErrorResponse(`Failed to list notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * POST /api/notifications
 * Create a notification
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            user_email,
            notification_type,
            message,
            task_id,
            group_id,
            extra_data = {},
        } = body;

        if (!user_email || !notification_type || !message) {
            return errorResponse('user_email, notification_type, and message are required', 400);
        }

        const newNotification = await prisma.notification.create({
            data: {
                userEmail: user_email,
                notificationType: notification_type,
                message,
                taskId: task_id || null,
                groupId: group_id || null,
                extraData: extra_data,
            },
        });

        return successResponse({
            success: true,
            notification_id: newNotification.id,
        }, 201);

    } catch (error) {
        console.error('Create notification error:', error);
        return serverErrorResponse(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
