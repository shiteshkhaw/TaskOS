import { z } from 'zod';

export const createHabitSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().optional().default(''),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
    userEmail: z.string().email(),
    reminderTime: z.string().optional().nullable(),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
    isActive: z.boolean().optional(),
    completedToday: z.boolean().optional(),
    streakCount: z.number().optional(),
    totalCompletions: z.number().optional(),
});
