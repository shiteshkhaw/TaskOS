import prisma from '@/lib/prisma';
import { sendPushToUser, isPushConfigured } from '@/lib/push';

export class NotificationService {
    /**
     * Creates an in-app notification and sends a push notification.
     */
    static async sendNotification(email: string, type: string, message: string, extra: any = {}) {
        try {
            // 1. Save to Database
            await prisma.notification.create({
                data: {
                    userEmail: email,
                    notificationType: type,
                    message,
                    taskId: extra.taskId,
                    groupId: extra.groupId,
                    extraData: extra.data || {},
                },
            });

            // 2. Send Push if configured
            if (isPushConfigured()) {
                await sendPushToUser(email, {
                    title: this.getDisplayTitle(type),
                    body: message,
                    url: extra.url || '/dashboard',
                });
            }
        } catch (error) {
            console.error('[NOTIFICATION_DISPATCH_ERROR]', error);
        }
    }

    private static getDisplayTitle(type: string) {
        switch (type) {
            case 'task_reminder': return '✅ Task Reminder';
            case 'habit_reminder': return '💪 Habit Time';
            case 'streak_reminder': return '🔥 Streak at Risk';
            default: return 'TaskOS Update';
        }
    }
}
