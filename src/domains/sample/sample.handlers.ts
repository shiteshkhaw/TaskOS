import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents, DomainEventPayload } from '@/core/events/event-types';
import { logger } from '@/core/logger/logger';

export class SampleHandlers {
    static register() {
        EventDispatcher.register(DomainEvents.TASK_COMPLETED, this.handleTaskCompleted);
    }

    private static async handleTaskCompleted(payload: DomainEventPayload) {
        // Example: Gamification/Behavior Logic handled asynchronously
        logger.info(`[EventHandler] Received TASK_COMPLETED event`, { payload });
        
        // Simulating DB write or external call
        await new Promise(resolve => setTimeout(resolve, 50));
        
        logger.info(`[EventHandler] Successfully awarded XP for task completion`, { userId: payload.userId });
    }
}

// Auto-register handlers when file is imported
SampleHandlers.register();
