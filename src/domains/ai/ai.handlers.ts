import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents, DomainEventPayload } from '@/core/events/event-types';
import { cache } from '@/core/cache/cache-client';
import { logger } from '@/core/logger/logger';

// Note: Cache clearing is now handled centrally by CacheHandlers in src/domains/cache/cache.handlers.ts
// We keep AIHandlers for ML training side-effects in the future.
export class AIHandlers {
    static register() {
        // Placeholder for future ML model feedback loop
        EventDispatcher.register(DomainEvents.TASK_COMPLETED, this.trainModelFeedback);
    }

    private static async trainModelFeedback(payload: DomainEventPayload) {
        // e.g. send to ML queue to learn user's completion patterns
        logger.debug(`[AIHandler] (Mock) Recording completion pattern for ML`, { userId: payload.userId });
    }
}

AIHandlers.register();
