import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents, DomainEventPayload } from '@/core/events/event-types';
import { logger } from '@/core/logger/logger';
import { BehaviorService } from './behavior.service';

export class BehaviorHandlers {
    static register() {
        EventDispatcher.register(DomainEvents.TASK_COMPLETED, this.onTaskCompleted);
        EventDispatcher.register(DomainEvents.HABIT_COMPLETED, this.onHabitCompleted);
    }

    private static async onTaskCompleted(payload: DomainEventPayload) {
        try {
            logger.info(`[BehaviorHandler] Logging TASK_COMPLETED event`, { userId: payload.userId });
            await BehaviorService.logEvent(
                payload.userId, 
                DomainEvents.TASK_COMPLETED, 
                payload.entityId, 
                'task', 
                payload.metadata
            );
        } catch (error) {
            logger.error(`[BehaviorHandler] Failed to log task completion`, { error, payload });
        }
    }

    private static async onHabitCompleted(payload: DomainEventPayload) {
        try {
            logger.info(`[BehaviorHandler] Logging HABIT_COMPLETED event`, { userId: payload.userId });
            await BehaviorService.logEvent(
                payload.userId, 
                DomainEvents.HABIT_COMPLETED, 
                payload.entityId, 
                'habit', 
                payload.metadata
            );
        } catch (error) {
            logger.error(`[BehaviorHandler] Failed to log habit completion`, { error, payload });
        }
    }
}

BehaviorHandlers.register();
