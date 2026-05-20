import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';

// Razorpay SDK - loaded dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let razorpayInstance: any = null;

async function getRazorpayInstance() {
    if (!razorpayInstance) {
        const Razorpay = (await import('razorpay')).default;
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            throw new Error('Razorpay configuration missing');
        }

        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    return razorpayInstance;
}

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for Pro upgrade
 */
export async function POST(request: NextRequest) {
    try {
        const user = getCurrentUser(request);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        // Check if already Pro
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            return errorResponse('User not found', 404);
        }

        if (dbUser.isPro) {
            return successResponse({
                success: false,
                message: 'You are already a Pro member!',
                alreadyPro: true,
            });
        }

        const body = await request.json();
        const amount = body.amount || 79900; // Default ₹799 in paise
        const currency = body.currency || 'INR';

        const razorpay = await getRazorpayInstance();

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount,
            currency,
            receipt: `pro_upgrade_${user.email}_${Date.now()}`,
            notes: {
                user_email: user.email,
                type: 'pro_upgrade',
            },
        });

        return successResponse({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        console.error('Create order error:', error);
        return serverErrorResponse(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
