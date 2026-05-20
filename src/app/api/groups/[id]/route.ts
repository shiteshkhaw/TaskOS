import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth.middleware';
import { successResponse, notFoundResponse, serverErrorResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

interface GroupParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/groups/[id]
 * Get a specific group. Must be a member.
 */
export const GET = withAuth(async (request: NextRequest, { params, user }) => {
    try {
        const { id } = await params;

        const group = await prisma.group.findUnique({
            where: { id },
            include: { groupMembers: true, _count: { select: { tasks: true } } },
        });

        if (!group) return notFoundResponse('Group not found');

        // Auth: must be a member
        const isMember = group.groupMembers.some(m => m.userEmail === user.email);
        if (!isMember) return forbiddenResponse('You are not a member of this group');

        return successResponse({
            id: group.id,
            name: group.name,
            createdBy: group.createdBy,
            members: group.members,
            description: group.description,
            createdAt: group.createdAt?.toISOString() ?? null,
            memberCount: group.groupMembers.length,
            taskCount: group._count.tasks,
        });
    } catch (error) {
        console.error('Get group error:', error);
        return serverErrorResponse('Failed to get group');
    }
});

/**
 * PUT /api/groups/[id]
 * Rename group. Only creator/admin can do this.
 */
export const PUT = withAuth(async (request: NextRequest, { params, user }) => {
    try {
        const { id } = await params;
        const { name } = await request.json() as { name?: string };

        if (!name || typeof name !== 'string' || !name.trim()) {
            return errorResponse('Group name is required', 400);
        }

        const group = await prisma.group.findUnique({
            where: { id },
            include: { groupMembers: { where: { userEmail: user.email } } },
        });

        if (!group) return notFoundResponse('Group not found');

        const member = group.groupMembers[0];
        if (!member || (member.role !== 'admin' && group.createdBy !== user.email)) {
            return forbiddenResponse('Only group admins can rename the group');
        }

        await prisma.group.update({ where: { id }, data: { name: name.trim() } });

        await prisma.groupActivity.create({
            data: { groupId: id, userEmail: user.email, actionType: 'GROUP_RENAMED', message: `${user.email} renamed the group to "${name.trim()}"` },
        });

        return successResponse({ success: true, message: 'Group renamed successfully' });
    } catch (error) {
        console.error('Update group error:', error);
        return serverErrorResponse('Failed to update group');
    }
});

/**
 * DELETE /api/groups/[id]
 * Delete group. Only the creator can delete.
 */
export const DELETE = withAuth(async (request: NextRequest, { params, user }) => {
    try {
        const { id } = await params;

        const group = await prisma.group.findUnique({ where: { id } });

        if (!group) return notFoundResponse('Group not found');

        if (group.createdBy !== user.email) {
            return forbiddenResponse('Only the group creator can delete the group');
        }

        await prisma.group.delete({ where: { id } });

        return successResponse({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Delete group error:', error);
        return serverErrorResponse('Failed to delete group');
    }
});
