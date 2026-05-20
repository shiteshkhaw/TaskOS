import { z } from 'zod';
import { emailSchema } from './common.validator';

export const createHabitSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().optional().default(''),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
    user_email: emailSchema,
    reminder_time: z.string().optional().nullable(),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
    is_active: z.boolean().optional(),
    completed_today: z.boolean().optional(),
    streak_count: z.number().optional(),
    total_completions: z.number().optional(),
});
