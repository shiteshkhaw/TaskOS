import { NextRequest } from 'next/server';
import { HabitService } from '@/domains/habits/habit.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';
import '@/domains/events/register-handlers';

interface CompleteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/habits/[id]/complete
 * POST  /api/habits/[id]/complete
 */
async function handleComplete(request: NextRequest, { params }: CompleteParams) {
    try {
        const { id } = await params;
        const result = await HabitService.completeHabit(id);

        return successResponse({
            success: true,
            message: 'Habit marked as complete',
            habit: result.habit,
            streak: result.streak,
            perfect_day: result.perfect_day,
        });

    } catch (error: any) {
        if (error?.statusCode === 404) {
            return notFoundResponse('Habit not found');
        }
        console.error('Complete habit error:', error);
        return serverErrorResponse('Failed to complete habit');
    }
}

export const PATCH = handleComplete;
export const POST = handleComplete;
