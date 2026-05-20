import { NextRequest } from 'next/server';
import { GroupService } from '@/domains/collaboration/group.service';
import { withAuth } from '@/middleware/auth.middleware';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * GET /api/groups
 * List user's groups
 */
export const GET = withAuth(async (request, { user }) => {
    try {
        const groups = await GroupService.listUserGroups(user.email);
        return successResponse(groups);
    } catch (error) {
        console.error('List groups error:', error);
        return serverErrorResponse('Failed to list groups');
    }
});

/**
 * POST /api/groups
 * Create new group
 */
export const POST = withAuth(async (request, { user }) => {
    try {
        const { name, description } = await request.json();
        if (!name) return errorResponse('Group name is required', 400);

        const group = await GroupService.createGroup(name, description, user.email);
        return successResponse(group, 201);
    } catch (error) {
        console.error('Create group error:', error);
        return serverErrorResponse('Failed to create group');
    }
});
