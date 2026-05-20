import { z } from 'zod';
import { emailSchema } from './common.validator';

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional().default(''),
    due_date: z.string().optional().nullable(),
    due_time: z.string().optional().nullable(),
    reminder_date: z.string().optional().nullable(),
    reminder_time: z.string().optional().nullable(),
    user_email: emailSchema,
    priority: z.number().min(1).max(3).optional().default(3),
    category: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    is_complete: z.boolean().optional(),
    done: z.boolean().optional(),
    completed_at: z.string().optional().nullable(),
    subtasks: z.array(z.any()).optional(),
});
