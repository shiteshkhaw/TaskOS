import prisma from '@/lib/prisma';
import { serializeTask } from '../tasks/task.serializer';

export class GroupService {
    /**
     * List all groups for a user.
     */
    static async listUserGroups(email: string) {
        return prisma.group.findMany({
            where: {
                groupMembers: {
                    some: { userEmail: email }
                }
            },
            include: {
                _count: { select: { groupMembers: true, tasks: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Creates a group and sets the creator as admin.
     */
    static async createGroup(name: string, description: string, creatorEmail: string) {
        const group = await prisma.group.create({
            data: {
                name,
                description,
                createdBy: creatorEmail,
                members: [creatorEmail], // Legacy compatibility
                groupMembers: {
                    create: { userEmail: creatorEmail, role: 'admin' }
                }
            }
        });

        await this.logActivity(group.id, creatorEmail, 'GROUP_CREATED', `Group "${name}" was created`);
        return group;
    }

    /**
     * Adds a member to a group.
     */
    static async addMember(groupId: string, email: string, invitedBy: string) {
        // Check if already a member
        const existing = await prisma.groupMember.findUnique({
            where: { groupId_userEmail: { groupId, userEmail: email } }
        });

        if (existing) return { alreadyMember: true };

        const member = await prisma.groupMember.create({
            data: { groupId, userEmail: email, role: 'member' }
        });

        // Update legacy members array
        await prisma.group.update({
            where: { id: groupId },
            data: { members: { push: email } }
        });

        await this.logActivity(groupId, email, 'MEMBER_JOINED', `${email} joined the group`);
        return member;
    }

    /**
     * Logs group activity.
     */
    static async logActivity(groupId: string, email: string, action: string, message: string) {
        return prisma.groupActivity.create({
            data: { groupId, userEmail: email, actionType: action, message }
        });
    }

    /**
     * Checks if a user is an admin of a group.
     */
    static async isAdmin(groupId: string, email: string) {
        const member = await prisma.groupMember.findUnique({
            where: { groupId_userEmail: { groupId, userEmail: email } }
        });
        return member?.role === 'admin';
    }

    /**
     * Fetches group activity feed.
     */
    static async getFeed(groupId: string, limit = 20) {
        return prisma.groupActivity.findMany({
            where: { groupId },
            orderBy: { occurredAt: 'desc' },
            take: limit
        });
    }
}
