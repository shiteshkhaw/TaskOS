import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth.middleware';
import { successResponse, notFoundResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';

interface LeaderboardParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/groups/[id]/leaderboard
 * Returns members sorted by completed tasks count within this group.
 * Only accessible by group members.
 */
export const GET = withAuth(async (request: NextRequest, { params, user }) => {
    try {
        const { id: groupId } = await params;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { groupMembers: true },
        });

        if (!group) return notFoundResponse('Group not found');

        // Must be a member
        const isMember = group.groupMembers.some(m => m.userEmail === user.email);
        if (!isMember) return forbiddenResponse('You are not a member of this group');

        // For each member, count completed tasks in this group + their streak data
        const leaderboardData = await Promise.all(
            group.groupMembers.map(async (member) => {
                const completedTasksCount = await prisma.task.count({
                    where: {
                        userEmail: member.userEmail,
                        groupId,
                        OR: [{ done: true }, { isComplete: true }],
                    },
                });

                const streak = await prisma.streak.findUnique({
                    where: { userEmail: member.userEmail },
                    select: { currentStreak: true, totalPoints: true, level: true },
                });

                const userRecord = await prisma.user.findUnique({
                    where: { email: member.userEmail },
                    select: { username: true, email: true },
                });

                return {
                    email: member.userEmail,
                    username: userRecord?.username || member.userEmail.split('@')[0],
                    role: member.role,
                    joinedAt: member.joinedAt,
                    tasksCompleted: completedTasksCount,
                    streak: streak?.currentStreak ?? 0,
                    totalPoints: streak?.totalPoints ?? 0,
                    level: streak?.level ?? 1,
                };
            })
        );

        // Sort by tasks completed descending
        leaderboardData.sort((a, b) => b.tasksCompleted - a.tasksCompleted || b.totalPoints - a.totalPoints);

        return successResponse(leaderboardData);
    } catch (error) {
        console.error('Leaderboard error:', error);
        return serverErrorResponse('Failed to fetch leaderboard');
    }
});
