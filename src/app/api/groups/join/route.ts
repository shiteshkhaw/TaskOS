import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * GET /api/groups/join
 * Join a group via invite link (using group_id query param)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('group_id');
        const email = searchParams.get('email');

        if (!groupId || !email) {
            return errorResponse('group_id and email are required', 400);
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return notFoundResponse('Group not found or invite link invalid');
        }

        // Check if already a member
        if (group.members.includes(email)) {
            return successResponse({
                success: true,
                message: 'You are already a member of this group',
                group_id: group.id,
                group_name: group.name,
                already_member: true,
            });
        }

        // Add user to group
        await prisma.group.update({
            where: { id: groupId },
            data: {
                members: { push: email },
            },
        });

        // Ensure user exists
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email },
        });

        return successResponse({
            success: true,
            message: 'Joined group successfully!',
            group_id: group.id,
            group_name: group.name,
        });

    } catch (error) {
        console.error('Join group error:', error);
        return serverErrorResponse(`Failed to join group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * POST /api/groups/join
 * Alternative POST method for joining
 */
export async function POST(request: NextRequest) {
    try {
        const { group_id, email } = await request.json();

        if (!group_id || !email) {
            return errorResponse('group_id and email are required', 400);
        }

        const group = await prisma.group.findUnique({
            where: { id: group_id },
        });

        if (!group) {
            return notFoundResponse('Group not found');
        }

        if (group.members.includes(email)) {
            return successResponse({
                success: true,
                message: 'Already a member',
                group_id: group.id,
                group_name: group.name,
                already_member: true,
            });
        }

        await prisma.group.update({
            where: { id: group_id },
            data: { members: { push: email } },
        });

        await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email },
        });

        return successResponse({
            success: true,
            message: 'Joined group successfully!',
            group_id: group.id,
            group_name: group.name,
        });

    } catch (error) {
        console.error('Join group error:', error);
        return serverErrorResponse(`Failed to join group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
