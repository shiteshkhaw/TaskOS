import { PrismaClient, Task } from '@/generated/prisma';
import prisma from '@/core/db/prisma';

export class SampleTaskRepository {
    static async completeTask(taskId: string, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<Task> {
        const client = (tx || prisma) as PrismaClient;
        
        return await client.task.update({
            where: { id: taskId },
            data: {
                isComplete: true,
                done: true,
                completedAt: new Date(),
            },
        });
    }

    static async getTask(taskId: string): Promise<Task | null> {
        return await prisma.task.findUnique({
            where: { id: taskId },
        });
    }
}
