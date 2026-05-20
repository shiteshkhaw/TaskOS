import { createTaskSchema, updateTaskSchema } from './task.schema';
import { TaskRepository } from './task.repository';
import { TaskDTO } from './task.dto';
import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents } from '@/core/events/event-types';
import { TransactionManager } from '@/core/db/transaction';
import { NotFoundError } from '@/core/errors/custom-errors';
import { AIPriorityService } from '@/domains/ai/ai-priority.service';
import { SortMode } from '@/domains/ai/ai.types';
import { logger } from '@/core/logger/logger';

import { cache } from '@/core/cache/cache-client';

export class TaskService {
    static async listTasks(email: string, sortMode: SortMode = 'smart') {
        const cacheKey = `taskos:user:${email}:tasks:list`;
        
        let tasksDto: any[] | null = await cache.get(cacheKey);

        if (!tasksDto) {
            logger.debug('[TaskService] Cache miss for task list', { email });
            const rawTasks = await TaskRepository.findAllByUser(email);
            tasksDto = TaskDTO.toResponseList(rawTasks);
            
            // Cache DB result for 5 minutes
            await cache.set(cacheKey, tasksDto, 300);
        } else {
            logger.debug('[TaskService] Cache hit for task list', { email });
        }

        if (sortMode === 'smart') {
            logger.info('Using SMART AI sort for tasks', { email });
            const smartSortedActive = await AIPriorityService.prioritize(email, tasksDto);
            const completedTasks = tasksDto.filter(t => t.is_complete);
            // Return smart active tasks first, followed by completed tasks
            return [...smartSortedActive, ...completedTasks];
        }

        return tasksDto;
    }

    static async createTask(data: any) {
        // Map snake_case to camelCase for backwards compatibility during transition
        const mappedData = {
            ...data,
            userEmail: data.user_email || data.userEmail,
            dueDate: data.due_date || data.dueDate,
            dueTime: data.due_time || data.dueTime,
            reminderDate: data.reminder_date || data.reminderDate,
            reminderTime: data.reminder_time || data.reminderTime,
        };
        const validated = createTaskSchema.parse(mappedData);
        
        const task = await TaskRepository.create(validated);

        // Async-ready event emission
        await EventDispatcher.emit({
            type: DomainEvents.TASK_CREATED, 
            userId: validated.userEmail,
            entityId: task.id,
            metadata: { title: task.title, action: 'created' },
            timestamp: new Date()
        });

        return TaskDTO.toResponse(task);
    }

    static async getTask(id: string) {
        const task = await TaskRepository.findById(id);
        if (!task) return null;
        return TaskDTO.toResponse(task);
    }

    static async updateTask(id: string, data: any) {
        // Map keys
        const mappedData = {
            ...data,
            isComplete: data.is_complete !== undefined ? data.is_complete : data.isComplete,
            completedAt: data.completed_at || data.completedAt,
            dueDate: data.due_date || data.dueDate,
            dueTime: data.due_time || data.dueTime,
        };
        const validated = updateTaskSchema.parse(mappedData);
        
        const updated = await TaskRepository.update(id, validated);

        await EventDispatcher.emit({
            type: DomainEvents.TASK_UPDATED, 
            userId: updated.userEmail,
            entityId: updated.id,
            metadata: { title: updated.title, action: 'updated' },
            timestamp: new Date()
        });

        return TaskDTO.toResponse(updated);
    }

    static async deleteTask(id: string, userEmail: string) {
        await TaskRepository.delete(id);
        
        await EventDispatcher.emit({
            type: DomainEvents.TASK_DELETED,
            userId: userEmail,
            entityId: id,
            timestamp: new Date()
        });
        
        return true;
    }
}
