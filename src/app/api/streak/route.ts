import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { updateUserStreak } from '@/lib/streak-utils';


/**
 * GET /api/streak
 * Get streak data for a user
 * Query params: email (required)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return errorResponse('Email parameter is required', 400);
        }

        // Get or create streak
        let streak = await prisma.streak.findUnique({
            where: { userEmail: email },
        });

        if (!streak) {
            // Ensure user exists first
            await prisma.user.upsert({
                where: { email },
                update: {},
                create: { email },
            });

            streak = await prisma.streak.create({
                data: {
                    userEmail: email,
                    currentStreak: 0,
                    longestStreak: 0,
                    totalPoints: 100, // Starting bonus
                    perfectHabitDays: 0,
                    badges: [],
                    level: 1,
                },
            });
        }

        return successResponse({
            user_email: streak.userEmail,
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            totalPoints: streak.totalPoints,
            lastActivityDate: streak.lastActivityDate ? streak.lastActivityDate.toISOString().split('T')[0] : null,
            perfectHabitDays: streak.perfectHabitDays,
            badges: streak.badges || [],
            level: streak.level,
        });

    } catch (error) {
        console.error('Get streak error:', error);
        return serverErrorResponse(`Failed to get streak: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * POST /api/streak
 * Update user streak when they complete an activity
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return errorResponse('Email parameter is required', 400);
        }

        const result = await updateUserStreak(email);

        return successResponse({
            user_email: email,
            currentStreak: result.currentStreak,
            totalPoints: result.totalPoints,
            pointsGained: result.pointsGained || 0,
            alreadyUpdated: !result.updated,
            newBadges: result.newBadges,
            message: result.updated ? 'Streak updated!' : 'Already updated today!',
        });

    } catch (error) {
        console.error('Update streak error:', error);
        return serverErrorResponse(`Failed to update streak: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
