import { z } from 'zod';
import { createTaskSchema, updateTaskSchema } from './task.schema';

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;

export interface TaskResponseDTO {
    id: string;
    title: string;
    description: string | null;
    user_email: string;
    priority: number;
    category: string | null;
    is_complete: boolean;
    done: boolean;
    due_date: string | null;
    due_time: string | null;
    completed_at: string | null;
    created_at: string;
    is_group_task: boolean;
    group_id: string | null;
    group_name: string | null;
    created_by: string | null;
    reminder_datetime: string | null;
    reminder_sent: boolean;
    subtasks: any;
}

