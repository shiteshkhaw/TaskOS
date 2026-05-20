import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

interface SubscribeRequest {
    user_email: string;
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
export async function POST(request: NextRequest) {
    try {
        const body: SubscribeRequest = await request.json();
        const { user_email, endpoint, keys } = body;

        if (!user_email || !endpoint || !keys?.p256dh || !keys?.auth) {
            return errorResponse('Missing required subscription details', 400);
        }

        // Upsert subscription (update if exists, create if not)
        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                userEmail: user_email,
                p256dh: keys.p256dh,
                auth: keys.auth,
                userAgent: request.headers.get('user-agent') || null,
            },
            create: {
                userEmail: user_email,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                userAgent: request.headers.get('user-agent') || null,
            },
        });

        return successResponse({
            success: true,
            message: 'Push subscription saved',
        });

    } catch (error) {
        console.error('Subscribe error:', error);
        return serverErrorResponse(`Failed to save subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
