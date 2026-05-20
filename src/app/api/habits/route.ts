import { NextRequest } from 'next/server';
import { HabitService } from '@/domains/habits/habit.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import '@/domains/events/register-handlers';

/**
 * GET /api/habits?email=...
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return errorResponse('Email parameter is required', 400);
        }

        const habits = await HabitService.listHabits(email);
        return successResponse(habits);

    } catch (error) {
        console.error('Fetch habits error:', error);
        return serverErrorResponse('Failed to fetch habits');
    }
}

/**
 * POST /api/habits
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const habit = await HabitService.createHabit(body);
        
        return successResponse(habit, 201);

    } catch (error: any) {
        if (error?.name === 'ZodError') {
            const firstError = error.issues?.[0] || error.errors?.[0];
            return errorResponse(firstError?.message || 'Validation failed', 400);
        }
        console.error('Create habit error:', error);
        return serverErrorResponse('Failed to create habit');
    }
}
