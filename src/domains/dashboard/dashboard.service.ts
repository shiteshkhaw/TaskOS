import { TaskService } from '@/domains/tasks/task.service';
import { HabitService } from '@/domains/habits/habit.service';
import { cache } from '@/core/cache/cache-client';
import { logger } from '@/core/logger/logger';

export class DashboardService {
    static async getSummary(userEmail: string) {
        const cacheKey = `taskos:user:${userEmail}:dashboard`;
        
        const cachedSummary = await cache.get(cacheKey);
        if (cachedSummary) {
            logger.debug('[DashboardService] Cache hit for dashboard summary', { userEmail });
            return cachedSummary;
        }

        logger.debug('[DashboardService] Cache miss for dashboard summary. Fetching concurrently.', { userEmail });

        // Parallel Execution: Fetch active dependencies concurrently to reduce latency
        const [tasks, habits] = await Promise.all([
            TaskService.listTasks(userEmail, 'smart'),
            HabitService.listHabits(userEmail) // HabitService.listHabits should ideally use its own caching, but we cache the aggregated result here
        ]);

        const activeTasksCount = tasks.filter(t => !t.isComplete).length;
        const habitsToComplete = habits.filter(h => !h.completedToday).length;

        const summary = {
            totalTasks: tasks.length,
            activeTasks: activeTasksCount,
            totalHabits: habits.length,
            habitsToComplete: habitsToComplete,
            topPriorityTasks: tasks.slice(0, 3) // Give them the top 3 AI sorted tasks
        };

        await cache.set(cacheKey, summary, 300); // Cache for 5 minutes

        return summary;
    }
}
