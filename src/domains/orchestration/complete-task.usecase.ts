import { TransactionManager } from '@/core/db/transaction';
import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents } from '@/core/events/event-types';
import { NotFoundError } from '@/core/errors/custom-errors';
import { TaskRepository } from '@/domains/tasks/task.repository';
import { TaskDTO } from '@/domains/tasks/task.dto';
import { logger } from '@/core/logger/logger';
import crypto from 'crypto';

export class CompleteTaskUseCase {
    static async execute(taskId: string, userEmail: string) {
        logger.info('Starting CompleteTaskUseCase', { taskId });

        const result = await TransactionManager.execute(async (tx) => {
            const task = await TaskRepository.findById(taskId, tx);
            if (!task || task.userEmail !== userEmail) {
                throw new NotFoundError('Task not found or unauthorized');
            }

            const updatedTask = await TaskRepository.update(taskId, {
                isComplete: true,
                done: true,
                completedAt: new Date().toISOString(),
            }, tx);

            logger.debug('Task updated successfully in DB.', { taskId });

            // Extract post-actions to be executed ONLY after transaction commits safely
            const postActions = [
                async () => {
                    await EventDispatcher.emit({
                        eventId: crypto.randomUUID(),
                        type: DomainEvents.TASK_COMPLETED,
                        userId: task.userEmail,
                        entityId: task.id,
                        metadata: { title: task.title },
                        timestamp: new Date()
                    });
                }
            ];

            return {
                updatedTask,
                postActions
            };
        });

        // Safely execute post-actions OUTSIDE the database transaction
        for (const action of result.postActions) {
            await action();
        }

        return TaskDTO.toResponse(result.updatedTask);
    }
}
