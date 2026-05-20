import { DomainEventPayload, DomainEventType } from './event-types';
import { logger } from '../logger/logger';

type EventHandler = (payload: DomainEventPayload) => Promise<void>;

export class EventDispatcher {
    private static handlers: Map<DomainEventType, EventHandler[]> = new Map();

    static register(eventType: DomainEventType, handler: EventHandler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler);
    }

    static async emit(payload: DomainEventPayload): Promise<void> {
        const handlers = this.handlers.get(payload.type) || [];
        
        logger.debug(`[EventDispatcher] Emitting event ${payload.type}`, { payload });

        for (const handler of handlers) {
            try {
                // Ensure handler is awaited to guarantee completion before request ends
                await handler(payload);
            } catch (error) {
                // FAILURE RESILIENCE: Never break the request flow if a handler fails
                logger.error(`[EventDispatcher] Event handler failed for ${payload.type}`, { 
                    error, 
                    payload 
                });
            }
        }
    }
}
