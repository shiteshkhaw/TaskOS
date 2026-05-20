import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth.middleware';
import { successResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * GET /api/analytics
 * Returns real aggregated analytics for the authenticated user:
 * - tasks completed per day (last 7 days)
 * - habits completed per day (last 7 days)
 * - streak and level info
 * - summary stats
 */
export const GET = withAuth(async (request: NextRequest, { user }) => {
    try {
        const now = new Date();
        const days: string[] = [];
        const dayLabels: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
            dayLabels.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]);
        }

        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        // Tasks completed per day (last 7 days)
        const completedTasks = await prisma.task.findMany({
            where: {
                userEmail: user.email,
                OR: [{ done: true }, { isComplete: true }],
                completedAt: { gte: weekStart },
            },
            select: { completedAt: true },
        });

        const tasksPerDay = days.map(day =>
            completedTasks.filter(t => t.completedAt && t.completedAt.toISOString().startsWith(day)).length
        );

        // Habits: fetch completionHistory + lastCompleted for fallback
        const habits = await prisma.habit.findMany({
            where: { userEmail: user.email },
            select: { completionHistory: true, lastCompleted: true, completedAt: true },
        });

        const habitsPerDay = days.map(day => {
            let count = 0;
            for (const habit of habits) {
                // Primary: check completionHistory JSON array
                const history = Array.isArray(habit.completionHistory)
                    ? (habit.completionHistory as string[])
                    : [];
                if (history.includes(day)) {
                    count++;
                    continue;
                }
                // Fallback: use lastCompleted date (covers habits completed before history tracking)
                const lastDate = habit.lastCompleted ?? habit.completedAt;
                if (lastDate && lastDate.toISOString().startsWith(day)) {
                    count++;
                }
            }
            return count;
        });

        // Total habits to calculate consistency %
        const totalHabits = habits.length || 1;
        const habitConsistency = habitsPerDay.map(h => Math.round((h / totalHabits) * 100));

        // Streak + level data
        const streak = await prisma.streak.findUnique({
            where: { userEmail: user.email },
            select: { currentStreak: true, longestStreak: true, totalPoints: true, level: true, perfectHabitDays: true },
        });

        // Summary stats
        const [totalTasksDone, totalTasksAll] = await Promise.all([
            prisma.task.count({ where: { userEmail: user.email, OR: [{ done: true }, { isComplete: true }] } }),
            prisma.task.count({ where: { userEmail: user.email } }),
        ]);

        const completionRate = totalTasksAll > 0 ? Math.round((totalTasksDone / totalTasksAll) * 100) : 0;

        return successResponse({
            weekdays: dayLabels,
            tasksCompleted: tasksPerDay,
            habitConsistency,
            streak: streak?.currentStreak ?? 0,
            longestStreak: streak?.longestStreak ?? 0,
            totalPoints: streak?.totalPoints ?? 0,
            level: streak?.level ?? 1,
            perfectHabitDays: streak?.perfectHabitDays ?? 0,
            totalTasksDone,
            totalTasksAll,
            completionRate,
            totalHabits,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return serverErrorResponse('Failed to fetch analytics');
    }
});
