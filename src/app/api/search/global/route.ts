import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * GET /api/search/global
 * Search across all content types
 * Query params: query (required), user_email (required), search_type (optional: all, tasks, habits, events)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const userEmail = searchParams.get('user_email');
        const searchType = searchParams.get('search_type') || 'all';

        if (!query || query.length < 1) {
            return errorResponse('Query parameter is required', 400);
        }

        if (!userEmail) {
            return errorResponse('User email is required', 400);
        }

        const queryLower = query.toLowerCase();

        const results: {
            tasks: object[];
            habits: object[];
            events: object[];
            groups: object[];
        } = {
            tasks: [],
            habits: [],
            events: [],
            groups: [],
        };

        // Search tasks
        if (searchType === 'all' || searchType === 'tasks') {
            const tasks = await prisma.task.findMany({
                where: { userEmail },
            });

            results.tasks = tasks
                .filter(
                    (t) =>
                        t.title.toLowerCase().includes(queryLower) ||
                        (t.description && t.description.toLowerCase().includes(queryLower))
                )
                .map((t) => ({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    user_email: t.userEmail,
                    is_complete: t.isComplete,
                    priority: t.priority,
                    due_date: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
                    type: 'task',
                }));
        }

        // Search habits
        if (searchType === 'all' || searchType === 'habits') {
            const habits = await prisma.habit.findMany({
                where: { userEmail },
            });

            results.habits = habits
                .filter((h) => h.title.toLowerCase().includes(queryLower))
                .map((h) => ({
                    id: h.id,
                    title: h.title,
                    description: h.description,
                    user_email: h.userEmail,
                    frequency: h.frequency,
                    streak_count: h.streakCount,
                    type: 'habit',
                }));
        }

        // Search events
        if (searchType === 'all' || searchType === 'events') {
            const events = await prisma.plannerEvent.findMany({
                where: { userEmail },
            });

            results.events = events
                .filter((e) => e.title.toLowerCase().includes(queryLower))
                .map((e) => ({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    event_date: e.date.toISOString().split('T')[0],
                    start_time: e.startTime,
                    category: e.category,
                    type: 'event',
                }));
        }

        return successResponse(results);

    } catch (error) {
        console.error('Search error:', error);
        return serverErrorResponse(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
