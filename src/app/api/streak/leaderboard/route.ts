import { NextRequest } from 'next/server';
import { GamificationService } from '@/domains/gamification/gamification.service';
import { successResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * GET /api/streak/leaderboard
 * Fetches the global leaderboard (cached for 60s).
 */
export async function GET(request: NextRequest) {
    try {
        const leaderboard = await GamificationService.getLeaderboard();
        return successResponse(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        return serverErrorResponse('Failed to fetch leaderboard');
    }
}
