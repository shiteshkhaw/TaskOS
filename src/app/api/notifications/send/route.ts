import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { sendPushToUser, isPushConfigured, PushPayload, PushResult } from '@/lib/push';

interface SendNotificationRequest {
    user_email: string;
    message: string;
    title?: string;
    url?: string;
    notification_type?: string;
    create_in_app?: boolean;
}

interface NotificationResponse {
    success: boolean;
    message: string;
    in_app_notification: {
        id: string;
        created: boolean;
    } | null;
    push_notification: {
        sent: number;
        failed: number;
        configured: boolean;
        reason?: string;
    };
}

/**
 * POST /api/notifications/send
 * Send a push notification and/or in-app notification to a user
 * 
 * This is a system endpoint for sending notifications programmatically.
 * In production, this should be protected with proper authentication.
 */
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const body: SendNotificationRequest = await request.json();
        const {
            user_email,
            message,
            title = 'TaskOS',
            url = '/',
            notification_type = 'system',
            create_in_app = true,
        } = body;

        // Validate required fields
        if (!user_email || !message) {
            return errorResponse('user_email and message are required', 400);
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { email: user_email },
        });

        if (!user) {
            return errorResponse('User not found', 404);
        }

        // Build response object
        const response: NotificationResponse = {
            success: true,
            message: 'Notification sent',
            in_app_notification: null,
            push_notification: {
                sent: 0,
                failed: 0,
                configured: isPushConfigured(),
            },
        };

        // Create in-app notification if requested
        if (create_in_app) {
            const notification = await prisma.notification.create({
                data: {
                    userEmail: user_email,
                    notificationType: notification_type,
                    message: message,
                    isRead: false,
                },
            });

            response.in_app_notification = {
                id: notification.id,
                created: true,
            };
        }

        // Send push notification if configured
        if (isPushConfigured()) {
            const payload: PushPayload = {
                title,
                body: message,
                url,
            };

            const pushResult: PushResult = await sendPushToUser(user_email, payload);
            response.push_notification = {
                sent: pushResult.sent,
                failed: pushResult.failed,
                configured: true,
            };
        } else {
            response.push_notification = {
                sent: 0,
                failed: 0,
                configured: false,
                reason: 'VAPID keys not configured',
            };
        }

        return successResponse(response);
    } catch (error) {
        console.error('Send notification error:', error);
        return serverErrorResponse(
            `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
