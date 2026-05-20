import { Habit } from '@/generated/prisma';

/**
 * Serializes a Habit database object to a standard API response format.
 */
export const serializeHabit = (habit: Habit) => {
    return {
        id: habit.id,
        user_email: habit.userEmail,
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        is_active: habit.isActive,
        completed_today: habit.completedToday,
        last_completed: habit.lastCompleted?.toISOString() || null,
        completed_at: habit.completedAt?.toISOString() || null,
        streak_count: habit.streakCount || 0,
        total_completions: habit.totalCompletions || 0,
        created_at: habit.createdAt?.toISOString() || null,
        reminder_time: habit.reminderTime,
        reminder_sent_date: habit.reminderSentDate?.toISOString().split('T')[0] || null,
        completion_history: habit.completionHistory || [],
    };
};
