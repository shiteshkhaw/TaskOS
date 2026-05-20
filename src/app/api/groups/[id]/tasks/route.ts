import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface TasksParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/groups/[id]/tasks
 * Get all tasks for a group
 */
export async function GET(request: NextRequest, { params }: TasksParams) {
    try {
        const { id } = await params;

        const group = await prisma.group.findUnique({
            where: { id },
        });

        if (!group) {
            return notFoundResponse('Group not found');
        }

        const tasks = await prisma.task.findMany({
            where: { groupId: id },
            orderBy: { createdAt: 'desc' },
        });

        const tasksData = tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            user_email: t.userEmail,
            done: t.done,
            is_complete: t.isComplete,
            priority: t.priority,
            category: t.category,
            due_date: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
            created_at: t.createdAt?.toISOString() || null,
            completed_at: t.completedAt?.toISOString() || null,
            is_group_task: t.isGroupTask,
            group_id: t.groupId,
            group_name: t.groupName,
            created_by: t.createdBy,
        }));

        return successResponse(tasksData);

    } catch (error) {
        console.error('Get group tasks error:', error);
        return serverErrorResponse(`Failed to get group tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * POST /api/groups/[id]/tasks
 * Create a task for a group
 */
export async function POST(request: NextRequest, { params }: TasksParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const group = await prisma.group.findUnique({
            where: { id },
        });

        if (!group) {
            return notFoundResponse('Group not found');
        }

        const {
            title,
            description = '',
            user_email,
            priority = 3,
            category,
            due_date,
            due_time,
        } = body;

        if (!title || !user_email) {
            return errorResponse('Title and user_email are required', 400);
        }

        // Check if user is a member
        if (!group.members.includes(user_email)) {
            return errorResponse('User is not a member of this group', 403);
        }

        // Ensure user exists
        await prisma.user.upsert({
            where: { email: user_email },
            update: {},
            create: { email: user_email },
        });

        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                userEmail: user_email,
                priority,
                category,
                dueDate: due_date ? new Date(due_date) : null,
                dueTime: due_time || null,
                isGroupTask: true,
                groupId: id,
                groupName: group.name,
                createdBy: user_email,
            },
        });

        return successResponse({
            success: true,
            message: 'Group task created successfully',
            task_id: newTask.id,
        }, 201);

    } catch (error) {
        console.error('Create group task error:', error);
        return serverErrorResponse(`Failed to create group task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
