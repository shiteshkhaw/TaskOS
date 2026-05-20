/**
 * Type definitions for TaskGuru models
 * These match the Prisma schema and can be used before Prisma client is generated
 */

export interface User {
    email: string;
    username: string | null;
    passwordHash: string | null;
    createdAt: Date;
    avatarUrl: string | null;
    isPro: boolean;
    stripeCustomerId: string | null;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    userEmail: string;
    done: boolean;
    isComplete: boolean;
    priority: number;
    category: string | null;
    dueDate: Date | null;
    dueTime: string | null;
    createdAt: Date;
    completedAt: Date | null;
    isGroupTask: boolean;
    groupId: string | null;
    groupName: string | null;
    createdBy: string | null;
    reminderDatetime: Date | null;
    reminderSent: boolean;
    subtasks: unknown;
}

export interface Habit {
    id: string;
    userEmail: string;
    title: string;
    description: string | null;
    frequency: string;
    isActive: boolean;
    completedToday: boolean;
    lastCompleted: Date | null;
    completedAt: Date | null;
    streakCount: number;
    totalCompletions: number;
    createdAt: Date;
    reminderTime: string | null;
    reminderSentDate: Date | null;
    completionHistory: unknown;
}

export interface PlannerEvent {
    id: string;
    userEmail: string;
    title: string;
    description: string | null;
    date: Date;
    startTime: string | null;
    endTime: string | null;
    category: string;
    color: string | null;
    isAllDay: boolean;
    completed: boolean;
    createdAt: Date;
    reminderMinutesBefore: number | null;
    reminderSent: boolean;
}

export interface Group {
    id: string;
    name: string;
    createdBy: string;
    createdAt: Date;
    description: string | null;
    members: string[];
}

export interface Streak {
    userEmail: string;
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    lastActivityDate: Date | null;
    perfectHabitDays: number;
    badges: unknown;
    level: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Notification {
    id: string;
    userEmail: string;
    notificationType: string;
    message: string;
    taskId: string | null;
    groupId: string | null;
    isRead: boolean;
    extraData: unknown;
    createdAt: Date;
    readAt: Date | null;
}

export interface PushSubscription {
    id: string;
    userEmail: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PasswordResetToken {
    id: string;
    userEmail: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}
