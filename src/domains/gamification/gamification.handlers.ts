import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents, DomainEventPayload } from '@/core/events/event-types';
import { logger } from '@/core/logger/logger';
import { GamificationService } from './gamification.service';
import { cache } from '@/core/cache/cache-client';

export class GamificationHandlers {
    static register() {
        EventDispatcher.register(DomainEvents.TASK_COMPLETED, this.onTaskCompleted);
    }

    private static async onTaskCompleted(payload: DomainEventPayload) {
        try {
            // Idempotency safeguard
            if (payload.eventId) {
                const idempotencyKey = `idempotency:gamification:${payload.eventId}`;
                const alreadyProcessed = await cache.get(idempotencyKey);
                if (alreadyProcessed) {
                    logger.debug(`[GamificationHandler] Event ${payload.eventId} already processed, skipping.`);
                    return;
                }
                // Mark as processed (cache for 24h)
                await cache.set(idempotencyKey, true, 86400);
            }

            logger.info(`[GamificationHandler] Processing XP for task completion`, { payload });
            
            await GamificationService.awardPoints(payload.userId, 15);
            
            logger.info(`[GamificationHandler] Successfully awarded 15 XP`, { userId: payload.userId });
        } catch (error) {
            logger.error(`[GamificationHandler] Failed to award XP`, { error, payload });
        }
    }
}

GamificationHandlers.register();
