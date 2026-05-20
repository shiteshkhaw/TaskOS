import { AIPriorityService } from '@/domains/ai/ai-priority.service';
import { TaskService } from '@/domains/tasks/task.service';
import { withAuth } from '@/middleware/auth.middleware';
import { withPro } from '@/middleware/pro.middleware';
import { successResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * POST /api/ai/suggest-priority
 * Ranks a user's open tasks using the AI Prioritization Engine.
 * Gated by PRO tier.
 */
export const POST = withAuth(
    withPro('AI_PRIORITIZATION', async (request, { user }) => {
        try {
            // Fetch user's tasks
            const tasks = await TaskService.listTasks(user.email);
            const openTasks = tasks.filter(t => !t.isComplete);

            if (openTasks.length === 0) {
                return successResponse({ suggestions: [], message: 'No open tasks to prioritize.' });
            }

            // Use AI Engine to rank — method is 'prioritize', not 'rankTasks'
            const ranked = await AIPriorityService.prioritize(user.email, openTasks);

            return successResponse({
                suggestions: ranked,
                message: 'Tasks prioritized based on urgency and historical performance.',
            });

        } catch (error) {
            console.error('AI priority error:', error);
            return serverErrorResponse('Failed to prioritize tasks');
        }
    })
);
