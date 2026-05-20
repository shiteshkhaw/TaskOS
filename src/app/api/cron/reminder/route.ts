import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { NotificationService } from '@/domains/notifications/notification.service';

const CRON_SECRET = process.env.CRON_SECRET || '';

/**
 * GET /api/cron/reminder
 * Background job to check and send reminders.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        if (CRON_SECRET && searchParams.get('secret') !== CRON_SECRET) {
            return errorResponse('Unauthorized', 401);
        }

        const now = new Date();
        const results = { tasks: 0, habits: 0, events: 0 };

        // 1. Tasks
        const tasksDue = await prisma.task.findMany({
            where: { reminderDatetime: { lte: now }, reminderSent: false, isComplete: false },
        });

        for (const task of tasksDue) {
            await NotificationService.sendNotification(
                task.userEmail,
                'task_reminder',
                `✅ Task Reminder: ${task.title}`,
                { taskId: task.id, url: '/dashboard/tasks' }
            );
            await prisma.task.update({ where: { id: task.id }, data: { reminderSent: true } });
            results.tasks++;
        }

        // 2. Habits (Simplified check)
        const todayStr = now.toISOString().split('T')[0];
        const habits = await prisma.habit.findMany({
            where: { 
                isActive: true, 
                completedToday: false,
                reminderTime: { not: null },
                OR: [{ reminderSentDate: null }, { reminderSentDate: { lt: new Date(todayStr) } }]
            },
        });

        for (const habit of habits) {
            const [h, m] = (habit.reminderTime || '09:00').split(':').map(Number);
            if (now.getHours() === h && now.getMinutes() >= m && now.getMinutes() < m + 10) {
                await NotificationService.sendNotification(
                    habit.userEmail,
                    'habit_reminder',
                    `💪 Habit Time: ${habit.title}!`,
                    { url: '/dashboard/habits' }
                );
                await prisma.habit.update({ where: { id: habit.id }, data: { reminderSentDate: new Date(todayStr) } });
                results.habits++;
            }
        }

        return successResponse({ success: true, results });

    } catch (error) {
        console.error('Cron error:', error);
        return serverErrorResponse('Cron job failed');
    }
}
