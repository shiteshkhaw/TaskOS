import { TaskResponseDTO } from '@/domains/tasks/task.types';
import { AIScoredTask } from './ai.types';
import { AIPrioritizationStrategy } from './ai.strategy';
import { RuleBasedStrategy } from './strategies/rule-based.strategy';
import { cache } from '@/core/cache/cache-client';
import { logger } from '@/core/logger/logger';

export class AIPriorityService {
    private static strategy: AIPrioritizationStrategy = new RuleBasedStrategy();

    static setStrategy(strategy: AIPrioritizationStrategy) {
        this.strategy = strategy;
    }

    static async prioritize(userId: string, tasks: TaskResponseDTO[]): Promise<AIScoredTask[]> {
        // 1. Filter out completed tasks from prioritization
        const activeTasks = tasks.filter(t => !t.is_complete);

        if (activeTasks.length === 0) return [];

        const cacheKey = `taskos:user:${userId}:ai-priorities`;

        // 2. Check Cache
        const cachedScores = await cache.get<Record<string, number>>(cacheKey);
        if (cachedScores) {
            logger.debug('[AIPriorityService] Using cached scores', { userId });
            const scoredTasks = activeTasks.map(task => ({
                ...task,
                aiScore: cachedScores[task.id] || 0,
            }));
            return this.sortTasks(scoredTasks);
        }

        logger.info('[AIPriorityService] Computing new smart priorities', { userId, taskCount: activeTasks.length });

        // 3. Compute Scores
        const scoredTasks = await this.strategy.scoreTasks(activeTasks);

        // 4. Update Cache
        const newCacheMap: Record<string, number> = {};
        scoredTasks.forEach(st => { newCacheMap[st.id] = st.aiScore; });
        await cache.set(cacheKey, newCacheMap, 3600); // 1 hour TTL

        // 5. Sort DESC
        return this.sortTasks(scoredTasks);
    }

    private static sortTasks(tasks: AIScoredTask[]): AIScoredTask[] {
        return tasks.sort((a, b) => b.aiScore - a.aiScore);
    }
}
