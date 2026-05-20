import prisma from '@/lib/prisma';

export const BehaviorEvent = {
    TASK_COMPLETED: 'TASK_COMPLETED',
    TASK_CREATED: 'TASK_CREATED',
    TASK_UPDATED: 'TASK_UPDATED',
    HABIT_COMPLETED: 'HABIT_COMPLETED',
    STREAK_EXTENDED: 'STREAK_EXTENDED',
    STREAK_BROKEN: 'STREAK_BROKEN',
    BADGE_EARNED: 'BADGE_EARNED',
} as const;

export class BehaviorService {
    /**
     * Log a user behavioral event.
     * Fires-and-forgets to avoid blocking the main request thread.
     */
    static async logEvent(email: string, event: string, entityId?: string, entityType?: string, metadata?: any) {
        try {
            await prisma.behaviorLog.create({
                data: {
                    userEmail: email,
                    eventType: event,
                    entityId,
                    entityType,
                    metadata: metadata || {},
                },
            });
        } catch (error) {
            console.error('[BEHAVIOR_LOG_ERROR]', error);
        }
    }

    /**
     * Get recent behavioral history for a user.
     */
    static async getUserHistory(email: string, days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        
        return prisma.behaviorLog.findMany({
            where: { 
                userEmail: email, 
                occurredAt: { gte: since } 
            },
            orderBy: { occurredAt: 'desc' },
        });
    }
}
