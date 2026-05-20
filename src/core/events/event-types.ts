export const DomainEvents = {
    TASK_CREATED: 'TASK_CREATED',
    TASK_UPDATED: 'TASK_UPDATED',
    TASK_DELETED: 'TASK_DELETED',
    TASK_COMPLETED: 'TASK_COMPLETED',
    HABIT_CREATED: 'HABIT_CREATED',
    HABIT_UPDATED: 'HABIT_UPDATED',
    HABIT_DELETED: 'HABIT_DELETED',
    HABIT_COMPLETED: 'HABIT_COMPLETED',
    STREAK_BROKEN: 'STREAK_BROKEN',
} as const;

export type DomainEventType = typeof DomainEvents[keyof typeof DomainEvents];

export interface DomainEventPayload {
    eventId?: string;
    type: DomainEventType;
    userId: string;
    entityId?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}
