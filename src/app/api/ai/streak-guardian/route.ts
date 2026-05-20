import { NextRequest } from 'next/server';
import { AIStreakGuardianService } from '@/domains/ai/services/ai-streak-guardian.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return errorResponse('Email is required', 400);
        }

        const alerts = await AIStreakGuardianService.evaluateRisks(email);

        return successResponse({
            success: true,
            alerts,
        });
    } catch (error) {
        console.error('AI Streak Guardian Error:', error);
        return serverErrorResponse('Failed to evaluate streak risks');
    }
}
