import { HabitRepository } from '@/domains/habits/habit.repository';
import { cache } from '@/core/cache/cache-client';
import { logger } from '@/core/logger/logger';

export interface StreakRiskAlert {
    habitId: string;
    title: string;
    riskLevel: 'high' | 'medium' | 'low';
    riskScore: number;
    message: string;
}

export class AIStreakGuardianService {
    static async evaluateRisks(email: string): Promise<StreakRiskAlert[]> {
        const cacheKey = `taskos:user:${email}:streak-guardian`;
        const cached = await cache.get<StreakRiskAlert[]>(cacheKey);
        
        if (cached) {
            logger.debug('[AIStreakGuardian] Returning cached risk alerts', { email });
            return cached;
        }

        logger.info('[AIStreakGuardian] Calculating streak risks', { email });
        
        const habits = await HabitRepository.findAllByUser(email);
        const activeIncompleteHabits = habits.filter(h => h.isActive && !h.completedToday);

        const alerts: StreakRiskAlert[] = [];
        const currentHour = new Date().getHours();

        for (const habit of activeIncompleteHabits) {
            let riskScore = 0;
            const streakCount = habit.streakCount || 0;

            // 1. Base risk if they have an active streak
            if (streakCount > 0) riskScore += 30;
            
            // 2. High stakes risk
            if (streakCount >= 7) riskScore += 20;
            
            // 3. Frequency risk
            if (habit.frequency === 'daily') riskScore += 30;

            // 4. Time of day risk (Late in the day = higher risk of forgetting)
            if (currentHour >= 17) {
                riskScore += 20; // Past 5 PM
            } else if (currentHour >= 12) {
                riskScore += 10; // Past noon
            }

            if (riskScore > 0) {
                let riskLevel: 'high' | 'medium' | 'low' = 'low';
                let message = `Don't forget to complete '${habit.title}' today.`;

                if (riskScore >= 70) {
                    riskLevel = 'high';
                    message = `🚨 HIGH RISK: You are about to lose your ${streakCount}-day streak for '${habit.title}'. Do it now!`;
                } else if (riskScore >= 40) {
                    riskLevel = 'medium';
                    message = `⚠️ Careful! Your ${streakCount}-day streak for '${habit.title}' is at risk today.`;
                }

                alerts.push({
                    habitId: habit.id,
                    title: habit.title,
                    riskLevel,
                    riskScore,
                    message
                });
            }
        }

        // Sort by highest risk first
        alerts.sort((a, b) => b.riskScore - a.riskScore);

        // Cache for 1 hour
        await cache.set(cacheKey, alerts, 3600);
        
        return alerts;
    }
}
