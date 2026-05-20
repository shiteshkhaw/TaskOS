import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth.middleware';
import { successResponse, notFoundResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';

interface ActivityParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/groups/[id]/activity
 * Returns the activity feed for a group.
 * Only accessible by group members.
 */
export const GET = withAuth(async (request: NextRequest, { params, user }) => {
    try {
        const { id: groupId } = await params;
        const { searchParams } = new URL(request.url);
        const limit = Math.min(Number(searchParams.get('limit') ?? '30'), 100);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { groupMembers: { select: { userEmail: true } } },
        });

        if (!group) return notFoundResponse('Group not found');

        const isMember = group.groupMembers.some(m => m.userEmail === user.email);
        if (!isMember) return forbiddenResponse('You are not a member of this group');

        const activities = await prisma.groupActivity.findMany({
            where: { groupId },
            orderBy: { occurredAt: 'desc' },
            take: limit,
        });

        return successResponse(activities);
    } catch (error) {
        console.error('Activity feed error:', error);
        return serverErrorResponse('Failed to fetch activity feed');
    }
});
