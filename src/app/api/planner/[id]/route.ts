import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

interface EventParams {
    params: Promise<{ id: string }>;
}

/**
 * PUT /api/planner/[id]
 * Update a planner event
 */
export async function PUT(request: NextRequest, { params }: EventParams) {
    try {
        const { id } = await params;
        const updates = await request.json();

        const event = await prisma.plannerEvent.findUnique({
            where: { id },
        });

        if (!event) {
            return notFoundResponse('Event not found');
        }

        // Map snake_case to camelCase for Prisma
        const prismaUpdates: Record<string, unknown> = {};

        if (updates.title !== undefined) prismaUpdates.title = updates.title;
        if (updates.description !== undefined) prismaUpdates.description = updates.description;
        if (updates.date !== undefined) prismaUpdates.date = new Date(updates.date);
        if (updates.start_time !== undefined) prismaUpdates.startTime = updates.start_time;
        if (updates.end_time !== undefined) prismaUpdates.endTime = updates.end_time;
        if (updates.category !== undefined) prismaUpdates.category = updates.category;
        if (updates.color !== undefined) prismaUpdates.color = updates.color;
        if (updates.is_all_day !== undefined) prismaUpdates.isAllDay = updates.is_all_day;
        if (updates.completed !== undefined) prismaUpdates.completed = updates.completed;
        if (updates.reminder_minutes_before !== undefined) prismaUpdates.reminderMinutesBefore = updates.reminder_minutes_before;

        await prisma.plannerEvent.update({
            where: { id },
            data: prismaUpdates,
        });

        return successResponse({ success: true, message: 'Event updated successfully' });

    } catch (error) {
        console.error('Update event error:', error);
        return serverErrorResponse(`Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * PATCH /api/planner/[id]
 * Partial update a planner event
 */
export async function PATCH(request: NextRequest, context: EventParams) {
    return PUT(request, context);
}


/**
 * DELETE /api/planner/[id]
 * Delete a planner event
 */
export async function DELETE(request: NextRequest, { params }: EventParams) {
    try {
        const { id } = await params;

        const event = await prisma.plannerEvent.findUnique({
            where: { id },
        });

        if (!event) {
            return notFoundResponse('Event not found');
        }

        await prisma.plannerEvent.delete({
            where: { id },
        });

        return successResponse({ success: true, message: 'Event deleted successfully' });

    } catch (error) {
        console.error('Delete event error:', error);
        return serverErrorResponse(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
