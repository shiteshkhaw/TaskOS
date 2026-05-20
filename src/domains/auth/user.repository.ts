import { prisma } from '@/core/db/prisma';

export class UserRepository {
    static async upsert(data: { email: string; name?: string; avatar?: string }) {
        return await prisma.user.upsert({
            where: { email: data.email },
            update: {
                username: data.name,
                avatarUrl: data.avatar,
            },
            create: {
                email: data.email,
                username: data.name,
                avatarUrl: data.avatar,
            }
        });
    }
}
