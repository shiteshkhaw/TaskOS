import { NextRequest } from 'next/server';
import { GamificationService } from '@/domains/gamification/gamification.service';
import { withAuth } from '@/middleware/auth.middleware';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * POST /api/streak/redeem-pro
 * Exchanges 5000 points for a Pro upgrade (Atomic).
 */
export const POST = withAuth(async (request, { user }) => {
    try {
        await GamificationService.redeemProWithPoints(user.email);
        
        return successResponse({ 
            success: true, 
            message: 'Successfully upgraded to TaskOS Pro!' 
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Redemption failed';
        if (message.includes('Insufficient points')) {
            return errorResponse(message, 400);
        }
        console.error('Redeem Pro error:', error);
        return serverErrorResponse('Failed to redeem Pro status');
    }
});
