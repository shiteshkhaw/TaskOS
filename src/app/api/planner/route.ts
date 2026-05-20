import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * GET /api/planner
 * List planner events for a user
 * Query params: email (required)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return errorResponse('Email parameter is required', 400);
        }

        const events = await prisma.plannerEvent.findMany({
            where: { userEmail: email },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });

        // Format response to match FastAPI format
        const eventsData = events.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            event_date: e.date.toISOString().split('T')[0],
            start_time: e.startTime,
            end_time: e.endTime,
            user_email: e.userEmail,
            category: e.category,
            color: e.color,
            is_all_day: e.isAllDay,
            completed: e.completed,
            reminder_minutes_before: e.reminderMinutesBefore,
            reminder_sent: e.reminderSent,
            created_at: e.createdAt?.toISOString() || null,
        }));

        return successResponse(eventsData);

    } catch (error) {
        console.error('List events error:', error);
        return serverErrorResponse(`Failed to list events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * POST /api/planner
 * Create a new planner event
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title,
            description = '',
            date,
            start_time,
            end_time,
            user_email,
            category = 'event',
            color,
            reminder_minutes_before,
        } = body;

        if (!title || !date || !user_email) {
            return errorResponse('Title, date, and user_email are required', 400);
        }

        // Ensure user exists
        await prisma.user.upsert({
            where: { email: user_email },
            update: {},
            create: { email: user_email },
        });

        const newEvent = await prisma.plannerEvent.create({
            data: {
                title,
                description,
                date: new Date(date),
                startTime: start_time || null,
                endTime: end_time || null,
                userEmail: user_email,
                category,
                color: color || null,
                reminderMinutesBefore: reminder_minutes_before || null,
            },
        });

        return successResponse({
            success: true,
            message: 'Event created successfully',
            event_id: newEvent.id,
        }, 201);

    } catch (error) {
        console.error('Create event error:', error);
        return serverErrorResponse(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
