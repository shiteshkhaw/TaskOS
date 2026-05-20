import { Task } from '@/generated/prisma';

/**
 * Serializes a Task database object to a standard API response format.
 * Ensures consistent snake_case naming and null handling.
 */
export const serializeTask = (task: Task) => {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        user_email: task.userEmail,
        done: task.done,
        is_complete: task.isComplete,
        priority: task.priority,
        category: task.category,
        due_date: task.dueDate?.toISOString().split('T')[0] || null,
        due_time: task.dueTime,
        created_at: task.createdAt?.toISOString() || null,
        completed_at: task.completedAt?.toISOString() || null,
        is_group_task: task.isGroupTask,
        group_id: task.groupId,
        group_name: task.groupName,
        created_by: task.createdBy,
        reminder_datetime: task.reminderDatetime?.toISOString() || null,
        reminder_sent: task.reminderSent,
        subtasks: task.subtasks || [],
    };
};
