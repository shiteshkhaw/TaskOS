import { createHabitSchema, updateHabitSchema } from './habit.schema';
import { HabitRepository } from './habit.repository';
import { HabitDTO } from './habit.dto';
import { EventDispatcher } from '@/core/events/event-dispatcher';
import { DomainEvents } from '@/core/events/event-types';
import { cache } from '@/core/cache/cache-client';
import { logger } from '@/core/logger/logger';
import { CompleteHabitUseCase } from '@/domains/orchestration/complete-habit.usecase';
import { updateUserStreak, checkPerfectHabitDay } from '@/lib/streak-utils';
import { NotFoundError } from '@/core/errors/custom-errors';

export class HabitService {
    static async listHabits(email: string) {
        const cacheKey = `taskos:user:${email}:habits:list`;
        
        let habitsDto: any[] | null = await cache.get(cacheKey);

        if (!habitsDto) {
            logger.debug('[HabitService] Cache miss for habit list', { email });
            const rawHabits = await HabitRepository.findAllByUser(email);
            habitsDto = HabitDTO.toResponseList(rawHabits);
            
            await cache.set(cacheKey, habitsDto, 300);
        } else {
            logger.debug('[HabitService] Cache hit for habit list', { email });
        }

        return habitsDto;
    }

    static async createHabit(data: any) {
        const mappedData = {
            ...data,
            userEmail: data.user_email || data.userEmail,
            reminderTime: data.reminder_time || data.reminderTime,
        };
        const validated = createHabitSchema.parse(mappedData);
        
        const habit = await HabitRepository.create(validated);

        await EventDispatcher.emit({
            type: DomainEvents.HABIT_CREATED, 
            userId: validated.userEmail,
            entityId: habit.id,
            metadata: { title: habit.title, action: 'created' },
            timestamp: new Date()
        });

        return HabitDTO.toResponse(habit);
    }

    static async getHabit(id: string) {
        const habit = await HabitRepository.findById(id);
        if (!habit) return null;
        return HabitDTO.toResponse(habit);
    }

    static async updateHabit(id: string, data: any) {
        const mappedData = {
            ...data,
            isActive: data.is_active !== undefined ? data.is_active : data.isActive,
            reminderTime: data.reminder_time || data.reminderTime,
            completedToday: data.completed_today !== undefined ? data.completed_today : data.completedToday,
            streakCount: data.streak_count !== undefined ? data.streak_count : data.streakCount,
            totalCompletions: data.total_completions !== undefined ? data.total_completions : data.totalCompletions,
        };
        const validated = updateHabitSchema.parse(mappedData);
        
        const updated = await HabitRepository.update(id, validated);

        await EventDispatcher.emit({
            type: DomainEvents.HABIT_UPDATED, 
            userId: updated.userEmail,
            entityId: updated.id,
            metadata: { title: updated.title, action: 'updated' },
            timestamp: new Date()
        });

        return HabitDTO.toResponse(updated);
    }

    static async deleteHabit(id: string, userEmail: string) {
        await HabitRepository.delete(id);
        
        await EventDispatcher.emit({
            type: DomainEvents.HABIT_DELETED,
            userId: userEmail,
            entityId: id,
            timestamp: new Date()
        });
        
        return true;
    }

    /**
     * Complete a habit — orchestrates DB update, streak, events
     */
    static async completeHabit(id: string) {
        const habit = await HabitRepository.findById(id);
        if (!habit) {
            throw new NotFoundError('Habit not found');
        }

        // Use the orchestration use case for transactional completion + events
        const updatedHabit = await CompleteHabitUseCase.execute(id, habit.userEmail);

        // Update streak (fire-and-forget safe)
        let streakResult: any = null;
        let perfectDay = false;
        try {
            streakResult = await updateUserStreak(habit.userEmail);
            perfectDay = await checkPerfectHabitDay(habit.userEmail);
        } catch (error) {
            logger.error('[HabitService] Streak update failed (non-fatal)', { error });
        }

        return {
            habit: updatedHabit,
            streak: streakResult,
            perfect_day: perfectDay,
        };
    }
}

