import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';

interface GroupParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/groups/[id]/leave
 * Leave a group (for non-creators)
 */
export async function POST(request: NextRequest, { params }: GroupParams) {
    try {
        const { id } = await params;
        const { user_email } = await request.json();

        if (!user_email) {
            return errorResponse('user_email is required', 400);
        }

        const group = await prisma.group.findUnique({
            where: { id },
        });

        if (!group) {
            return notFoundResponse('Group not found');
        }

        // Creator cannot leave - must delete the group
        if (group.createdBy === user_email) {
            return forbiddenResponse('Group creator cannot leave. Delete the group instead.');
        }

        // Check if user is a member
        if (!group.members.includes(user_email)) {
            return errorResponse('User is not a member of this group', 400);
        }

        // Remove user from members
        const updatedMembers = group.members.filter((m: string) => m !== user_email);

        await prisma.group.update({
            where: { id },
            data: { members: updatedMembers },
        });

        // Remove user's tasks from this group (or unlink them)
        await prisma.task.updateMany({
            where: {
                groupId: id,
                userEmail: user_email,
            },
            data: {
                isGroupTask: false,
                groupId: null,
                groupName: null,
            },
        });

        return successResponse({
            success: true,
            message: 'Left group successfully',
        });

    } catch (error) {
        console.error('Leave group error:', error);
        return serverErrorResponse(`Failed to leave group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
