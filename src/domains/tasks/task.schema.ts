import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional().default(''),
    dueDate: z.string().optional().nullable(),
    dueTime: z.string().optional().nullable(),
    reminderDate: z.string().optional().nullable(),
    reminderTime: z.string().optional().nullable(),
    userEmail: z.string().email(),
    priority: z.number().min(1).max(3).optional().default(3),
    category: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    isComplete: z.boolean().optional(),
    done: z.boolean().optional(),
    completedAt: z.string().optional().nullable(),
    subtasks: z.array(z.any()).optional(),
});
