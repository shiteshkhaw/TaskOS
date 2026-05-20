import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth.middleware';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';

interface MembersParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/groups/[id]/members
 * Add a member to a group (admin only).
 * Body: { email: string }
 */
export const POST = withAuth(async (request: NextRequest, { params, user }) => {
    try {
        const { id: groupId } = await params;
        const body = await request.json() as { email?: string };
        const email = body?.email?.trim();

        if (!email) return errorResponse('Email is required', 400);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { groupMembers: true },
        });

        if (!group) return notFoundResponse('Group not found');

        // Must be admin or creator
        const caller = group.groupMembers.find(m => m.userEmail === user.email);
        if (!caller || (caller.role !== 'admin' && group.createdBy !== user.email)) {
            return forbiddenResponse('Only group admins can add members');
        }

        // Already a member?
        if (group.groupMembers.some(m => m.userEmail === email)) {
            return successResponse({ success: true, message: 'User is already a member', already_member: true });
        }

        // Upsert user (so foreign key never fails for new email)
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email },
        });

        await prisma.groupMember.create({ data: { groupId, userEmail: email, role: 'member' } });
        await prisma.group.update({ where: { id: groupId }, data: { members: { push: email } } });

        await prisma.groupActivity.create({
            data: { groupId, userEmail: user.email, actionType: 'MEMBER_ADDED', message: `${user.email} added ${email} to the group` },
        });

        return successResponse({ success: true, message: 'Member added successfully' }, 201);
    } catch (error) {
        console.error('Add member error:', error);
        return serverErrorResponse('Failed to add member');
    }
});

/**
 * DELETE /api/groups/[id]/members?email=...
 * Remove a member from a group (admin only, cannot remove creator).
 */
export const DELETE = withAuth(async (request: NextRequest, { params, user }) => {
    try {
        const { id: groupId } = await params;
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) return errorResponse('Email query param is required', 400);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { groupMembers: true },
        });

        if (!group) return notFoundResponse('Group not found');

        const caller = group.groupMembers.find(m => m.userEmail === user.email);
        if (!caller || (caller.role !== 'admin' && group.createdBy !== user.email)) {
            return forbiddenResponse('Only group admins can remove members');
        }

        if (group.createdBy === email) {
            return errorResponse('Cannot remove the group creator', 400);
        }

        await prisma.groupMember.deleteMany({ where: { groupId, userEmail: email } });
        const updatedMembers = group.members.filter((m: string) => m !== email);
        await prisma.group.update({ where: { id: groupId }, data: { members: updatedMembers } });

        await prisma.groupActivity.create({
            data: { groupId, userEmail: user.email, actionType: 'MEMBER_REMOVED', message: `${user.email} removed ${email} from the group` },
        });

        return successResponse({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        console.error('Remove member error:', error);
        return serverErrorResponse('Failed to remove member');
    }
});
