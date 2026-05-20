import { TransactionManager } from '@/core/db/transaction';
import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents } from '@/core/events/event-types';
import { NotFoundError } from '@/core/errors/custom-errors';
import { HabitRepository } from '@/domains/habits/habit.repository';
import { HabitDTO } from '@/domains/habits/habit.dto';
import { logger } from '@/core/logger/logger';

export class CompleteHabitUseCase {
    static async execute(habitId: string, userEmail: string) {
        logger.info('Starting CompleteHabitUseCase', { habitId });

        const result = await TransactionManager.execute(async (tx) => {
            const habit = await HabitRepository.findById(habitId, tx);
            if (!habit || habit.userEmail !== userEmail) {
                throw new NotFoundError('Habit not found or unauthorized');
            }

            const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
            const existingHistory: string[] = Array.isArray(habit.completionHistory)
                ? (habit.completionHistory as string[])
                : [];

            // Only add today if not already recorded
            const updatedHistory = existingHistory.includes(today)
                ? existingHistory
                : [...existingHistory, today];

            const updatedHabit = await tx.habit.update({
                where: { id: habitId },
                data: {
                    completedToday: true,
                    lastCompleted: new Date(),
                    completedAt: new Date(),
                    totalCompletions: { increment: 1 },
                    streakCount: { increment: 1 },
                    completionHistory: updatedHistory,
                }
            });

            logger.debug('Habit updated successfully in DB.', { habitId });

            const postActions = [
                async () => {
                    await EventDispatcher.emit({
                        type: DomainEvents.HABIT_COMPLETED,
                        userId: updatedHabit.userEmail,
                        entityId: updatedHabit.id,
                        metadata: { title: updatedHabit.title },
                        timestamp: new Date()
                    });
                }
            ];

            return {
                updatedHabit,
                postActions
            };
        });

        for (const action of result.postActions) {
            await action();
        }

        return HabitDTO.toResponse(result.updatedHabit);
    }
}
