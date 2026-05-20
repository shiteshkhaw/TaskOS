import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth.middleware';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';

interface InviteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/groups/[id]/invite
 * Invite a user to a group with a specific role.
 * Only admins/creators can invite.
 * Body: { email: string, role: "member" | "admin" }
 */
export const POST = withAuth(async (request: NextRequest, { params, user }) => {
    try {
        const { id: groupId } = await params;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { groupMembers: true },
        });

        if (!group) return notFoundResponse('Group not found');

        // Authorization: only admins or the creator can invite
        const callerMember = group.groupMembers.find(m => m.userEmail === user.email);
        if (!callerMember || (callerMember.role !== 'admin' && group.createdBy !== user.email)) {
            return forbiddenResponse('Only group admins can invite members');
        }

        const body = await request.json();
        const { email, role } = body as { email?: string; role?: string };

        if (!email || typeof email !== 'string') {
            return errorResponse('Email is required', 400);
        }
        // Validate role
        const allowedRoles = ['member', 'admin'];
        const assignedRole = allowedRoles.includes(role ?? '') ? (role as string) : 'member';

        // Check already a member
        const existing = group.groupMembers.find(m => m.userEmail === email);
        if (existing) {
            return errorResponse('User is already a member of this group', 409);
        }

        // Ensure the invited user exists (upsert to prevent FK violation)
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email },
        });

        // Add to GroupMember table
        await prisma.groupMember.create({
            data: { groupId, userEmail: email, role: assignedRole },
        });

        // Keep legacy members array in sync
        await prisma.group.update({
            where: { id: groupId },
            data: { members: { push: email } },
        });

        // Log activity
        await prisma.groupActivity.create({
            data: {
                groupId,
                userEmail: user.email,
                actionType: 'MEMBER_INVITED',
                message: `${user.email} invited ${email} as ${assignedRole}`,
            },
        });

        return successResponse({ success: true, message: `${email} invited as ${assignedRole}` }, 201);
    } catch (error) {
        console.error('Invite error:', error);
        return serverErrorResponse('Failed to send invite');
    }
});
