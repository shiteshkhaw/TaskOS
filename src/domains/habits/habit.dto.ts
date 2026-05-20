import { Habit } from '@/generated/prisma';
import { HabitResponseDTO } from './habit.types';

export class HabitDTO {
    static toResponse(habit: Habit): HabitResponseDTO {
        return {
            id: habit.id,
            title: habit.title,
            description: habit.description,
            frequency: habit.frequency || 'daily',
            user_email: habit.userEmail,
            reminder_time: habit.reminderTime,
            is_active: habit.isActive ?? true,
            completed_today: habit.completedToday ?? false,
            streak_count: habit.streakCount ?? 0,
            total_completions: habit.totalCompletions ?? 0,
            last_completed: habit.lastCompleted ? habit.lastCompleted.toISOString() : null,
            completed_at: habit.completedAt ? habit.completedAt.toISOString() : null,
            created_at: habit.createdAt ? habit.createdAt.toISOString() : new Date().toISOString(),
            completion_history: habit.completionHistory || [],
        };
    }

    static toResponseList(habits: Habit[]): HabitResponseDTO[] {
        return habits.map(HabitDTO.toResponse);
    }
}

