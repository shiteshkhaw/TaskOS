import { NextRequest } from 'next/server';
import { HabitService } from '@/domains/habits/habit.service';
import { HabitRepository } from '@/domains/habits/habit.repository';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';
import '@/domains/events/register-handlers';

interface HabitParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/habits/[id]
 */
export async function GET(request: NextRequest, { params }: HabitParams) {
    try {
        const { id } = await params;
        const habit = await HabitService.getHabit(id);
        
        if (!habit) {
            return notFoundResponse('Habit not found');
        }

        return successResponse(habit);

    } catch (error) {
        console.error('Fetch habit error:', error);
        return serverErrorResponse('Failed to fetch habit');
    }
}

/**
 * PUT /api/habits/[id]
 */
export async function PUT(request: NextRequest, { params }: HabitParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const habit = await HabitService.updateHabit(id, body);
        return successResponse(habit);

    } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return errorResponse((error as any).errors[0].message, 400);
        }
        console.error('Update habit error:', error);
        return serverErrorResponse('Failed to update habit');
    }
}

/**
 * PATCH /api/habits/[id] — alias for PUT
 */
export async function PATCH(request: NextRequest, context: HabitParams) {
    return PUT(request, context);
}

/**
 * DELETE /api/habits/[id]
 */
export async function DELETE(request: NextRequest, { params }: HabitParams) {
    try {
        const { id } = await params;
        
        // Must fetch habit first to get userEmail for event dispatch
        const habit = await HabitRepository.findById(id);
        if (!habit) {
            return notFoundResponse('Habit not found');
        }

        await HabitService.deleteHabit(id, habit.userEmail);
        return successResponse({ success: true, message: 'Habit deleted successfully' });

    } catch (error) {
        console.error('Delete habit error:', error);
        return serverErrorResponse('Failed to delete habit');
    }
}
