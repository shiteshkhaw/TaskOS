import { TransactionManager } from '@/core/db/transaction';
import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents } from '@/core/events/event-types';
import { logger } from '@/core/logger/logger';
import { cache } from '@/core/cache/cache-client';
import { NotFoundError } from '@/core/errors/custom-errors';
import { SampleTaskRepository } from './sample.repository';

export class SampleTaskService {
    static async completeTask(taskId: string, userEmail: string) {
        logger.info(`Starting task completion process`, { taskId });

        const task = await SampleTaskRepository.getTask(taskId);
        if (!task || task.userEmail !== userEmail) {
            throw new NotFoundError('Task not found or unauthorized');
        }

        // Execute as Atomic Transaction
        const updatedTask = await TransactionManager.execute(async (tx) => {
            logger.debug(`Inside transaction: Updating task ${taskId}`);
            return await SampleTaskRepository.completeTask(taskId, tx);
        });

        // Fire & Forget Event (Async-ready decoupling)
        await EventDispatcher.emit({
            type: DomainEvents.TASK_COMPLETED,
            userId: userEmail,
            entityId: taskId,
            metadata: { title: updatedTask.title },
            timestamp: new Date()
        });

        // Update Cache strategy
        logger.info(`Invalidating user cache`, { userEmail });
        await cache.delete(`taskos:user:${userEmail}:tasks:active`);

        return updatedTask;
    }
}
