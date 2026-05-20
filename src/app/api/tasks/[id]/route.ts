import { NextRequest } from 'next/server';
import { TaskService } from '@/domains/tasks/task.service';
import { CompleteTaskUseCase } from '@/domains/orchestration/complete-task.usecase';
import { TaskRepository } from '@/domains/tasks/task.repository';
import { successResponse, notFoundResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { updateUserStreak } from '@/lib/streak-utils';
import { logger } from '@/core/logger/logger';
import '@/domains/events/register-handlers';

interface TaskParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]
 */
export async function GET(request: NextRequest, { params }: TaskParams) {
    try {
        const { id } = await params;
        const task = await TaskService.getTask(id);

        if (!task) {
            return notFoundResponse('Task not found');
        }

        return successResponse(task);

    } catch (error) {
        console.error('Get task error:', error);
        return serverErrorResponse(`Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * PUT /api/tasks/[id]
 * Update a task — routes through domain layer for validation + events
 */
export async function PUT(request: NextRequest, { params }: TaskParams) {
    try {
        const { id } = await params;
        const updates = await request.json();

        // Check if this is a completion action
        const isCompletion = updates.is_complete === true || updates.done === true;
        const existingTask = await TaskService.getTask(id);

        if (!existingTask) {
            return notFoundResponse('Task not found');
        }

        if (isCompletion && !existingTask.is_complete) {
            // Use CompleteTaskUseCase for completion — triggers XP, events, cache invalidation
            const result = await CompleteTaskUseCase.execute(id, existingTask.user_email);

            // Update streak (non-fatal)
            try {
                await updateUserStreak(existingTask.user_email);
            } catch (e) {
                logger.error('[TaskRoute] Streak update failed (non-fatal)', { error: e });
            }

            return successResponse({ 
                success: true, 
                message: 'Task completed successfully', 
                task: result 
            });
        }

        // Regular update — through domain service
        const updated = await TaskService.updateTask(id, updates);
        return successResponse({ 
            success: true, 
            message: 'Task updated successfully', 
            task: updated 
        });

    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return errorResponse(error.errors[0].message, 400);
        }
        if (error?.statusCode === 404) {
            return notFoundResponse(error.message);
        }
        console.error('Update task error:', error);
        return serverErrorResponse(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * PATCH /api/tasks/[id] — alias for PUT
 */
export async function PATCH(request: NextRequest, context: TaskParams) {
    return PUT(request, context);
}

/**
 * DELETE /api/tasks/[id]
 */
export async function DELETE(request: NextRequest, { params }: TaskParams) {
    try {
        const { id } = await params;

        const task = await TaskService.getTask(id);
        if (!task) {
            return notFoundResponse('Task not found');
        }

        await TaskService.deleteTask(id, task.user_email);
        return successResponse({ success: true, message: 'Task deleted successfully' });

    } catch (error) {
        console.error('Delete task error:', error);
        return serverErrorResponse(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
