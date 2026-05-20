import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

interface VerifyRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

/**
 * POST /api/payments/verify
 * Verify Razorpay payment and upgrade user to Pro
 */
export async function POST(request: NextRequest) {
    try {
        const user = getCurrentUser(request);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        const body: VerifyRequest = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return errorResponse('Missing payment verification parameters', 400);
        }

        // Verify signature
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            return serverErrorResponse('Payment configuration missing');
        }

        const body_str = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body_str)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.error('Payment signature verification failed');
            return errorResponse('Payment verification failed. Invalid signature.', 400);
        }

        // Check if user exists
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            return errorResponse('User not found', 404);
        }

        // Idempotency check - if already Pro, return success
        if (dbUser.isPro) {
            return successResponse({
                success: true,
                message: 'Already upgraded to Pro!',
                isPro: true,
            });
        }

        // Upgrade user to Pro
        await prisma.user.update({
            where: { email: user.email },
            data: {
                isPro: true,
                stripeCustomerId: razorpay_payment_id, // Store payment ID for reference
            },
        });

        console.log(`✅ User ${user.email} upgraded to Pro via Razorpay payment ${razorpay_payment_id}`);

        return successResponse({
            success: true,
            message: 'Payment verified! Upgraded to Pro.',
            isPro: true,
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        return serverErrorResponse(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
