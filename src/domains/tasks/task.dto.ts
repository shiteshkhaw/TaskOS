import { Task } from '@/generated/prisma';
import { TaskResponseDTO } from './task.types';

export class TaskDTO {
    static toResponse(task: Task): TaskResponseDTO {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            user_email: task.userEmail,
            priority: task.priority ?? 3,
            category: task.category,
            is_complete: task.isComplete ?? false,
            done: task.done ?? false,
            due_date: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
            due_time: task.dueTime,
            completed_at: task.completedAt ? task.completedAt.toISOString() : null,
            created_at: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
            is_group_task: task.isGroupTask ?? false,
            group_id: task.groupId,
            group_name: task.groupName,
            created_by: task.createdBy,
            reminder_datetime: task.reminderDatetime ? task.reminderDatetime.toISOString() : null,
            reminder_sent: task.reminderSent ?? false,
            subtasks: task.subtasks || [],
        };
    }

    static toResponseList(tasks: Task[]): TaskResponseDTO[] {
        return tasks.map(TaskDTO.toResponse);
    }
}
