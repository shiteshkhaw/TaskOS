import { successResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * GET /api/notifications/vapid-key
 * Get VAPID public key for push notifications
 */
export async function GET() {
    try {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
            return serverErrorResponse('VAPID key not configured');
        }

        return successResponse({
            publicKey: vapidPublicKey,
        });

    } catch (error) {
        console.error('Get VAPID key error:', error);
        return serverErrorResponse(`Failed to get VAPID key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
