import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents, DomainEventPayload } from '@/core/events/event-types';
import { cache } from '@/core/cache/cache-client';
import { logger } from '@/core/logger/logger';

export class CacheHandlers {
    static register() {
        // Task Invalidation
        EventDispatcher.register(DomainEvents.TASK_CREATED, this.invalidateTaskCaches);
        EventDispatcher.register(DomainEvents.TASK_UPDATED, this.invalidateTaskCaches);
        EventDispatcher.register(DomainEvents.TASK_COMPLETED, this.invalidateTaskCaches);
        EventDispatcher.register(DomainEvents.TASK_DELETED, this.invalidateTaskCaches);

        // Habit Invalidation
        EventDispatcher.register(DomainEvents.HABIT_CREATED, this.invalidateHabitCaches);
        EventDispatcher.register(DomainEvents.HABIT_UPDATED, this.invalidateHabitCaches);
        EventDispatcher.register(DomainEvents.HABIT_COMPLETED, this.invalidateHabitCaches);
        EventDispatcher.register(DomainEvents.HABIT_DELETED, this.invalidateHabitCaches);
    }

    private static async invalidateTaskCaches(payload: DomainEventPayload) {
        try {
            // Delete raw task list cache
            await cache.delete(`taskos:user:${payload.userId}:tasks:list`);
            // Delete AI priority cache
            await cache.delete(`taskos:user:${payload.userId}:ai-priorities`);
            // Delete dashboard aggregation cache
            await cache.delete(`taskos:user:${payload.userId}:dashboard`);

            logger.debug(`[CacheHandler] Invalidated Task & Dashboard caches`, { userId: payload.userId });
        } catch (error) {
            logger.error(`[CacheHandler] Failed to invalidate caches`, { error, userId: payload.userId });
        }
    }

    private static async invalidateHabitCaches(payload: DomainEventPayload) {
        try {
            await cache.delete(`taskos:user:${payload.userId}:habits:list`);
            await cache.delete(`taskos:user:${payload.userId}:dashboard`);
            await cache.delete(`taskos:user:${payload.userId}:streak-guardian`);

            logger.debug(`[CacheHandler] Invalidated Habit & Dashboard & Guardian caches`, { userId: payload.userId });
        } catch (error) {
            logger.error(`[CacheHandler] Failed to invalidate caches`, { error, userId: payload.userId });
        }
    }
}

CacheHandlers.register();
