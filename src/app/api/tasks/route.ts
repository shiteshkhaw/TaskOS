import { NextRequest } from 'next/server';
import { TaskService } from '@/domains/tasks/task.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import '@/domains/events/register-handlers';

/**
 * GET /api/tasks?email=...
 * Fetch all tasks for a user
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return errorResponse('Email parameter is required', 400);
        }

        const tasks = await TaskService.listTasks(email);
        return successResponse(tasks);

    } catch (error) {
        console.error('Fetch tasks error:', error);
        return serverErrorResponse('Failed to fetch tasks');
    }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const task = await TaskService.createTask(body);
        
        return successResponse(task, 201);

    } catch (error: any) {
        // Handle Zod validation errors (supports both v3 .errors and v4 .issues)
        if (error?.name === 'ZodError') {
            const firstError = error.issues?.[0] || error.errors?.[0];
            return errorResponse(firstError?.message || 'Validation failed', 400);
        }
        console.error('Create task error:', error);
        return serverErrorResponse('Failed to create task');
    }
}
