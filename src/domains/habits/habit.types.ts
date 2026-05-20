import { z } from 'zod';
import { createHabitSchema, updateHabitSchema } from './habit.schema';

export type CreateHabitDTO = z.infer<typeof createHabitSchema>;
export type UpdateHabitDTO = z.infer<typeof updateHabitSchema>;

export interface HabitResponseDTO {
    id: string;
    title: string;
    description: string | null;
    frequency: string;
    user_email: string;
    reminder_time: string | null;
    is_active: boolean;
    completed_today: boolean;
    streak_count: number;
    total_completions: number;
    last_completed: string | null;
    completed_at: string | null;
    created_at: string;
    completion_history: any;
}

