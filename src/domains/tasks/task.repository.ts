import prisma from '@/core/db/prisma';
import { Prisma, Task } from '@/generated/prisma';
import { CreateTaskDTO, UpdateTaskDTO } from './task.types';

export class TaskRepository {
    static async findAllByUser(email: string, tx?: Prisma.TransactionClient): Promise<Task[]> {
        if (tx) return tx.task.findMany({ where: { userEmail: email }, orderBy: { createdAt: 'desc' } });
        return prisma.task.findMany({ where: { userEmail: email }, orderBy: { createdAt: 'desc' } });
    }

    static async findById(id: string, tx?: Prisma.TransactionClient): Promise<Task | null> {
        if (tx) return tx.task.findUnique({ where: { id } });
        return prisma.task.findUnique({ where: { id } });
    }

    static async create(data: CreateTaskDTO, tx?: Prisma.TransactionClient): Promise<Task> {
        const payload = {
            data: {
                title: data.title,
                description: data.description,
                userEmail: data.userEmail,
                priority: data.priority,
                category: data.category,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                dueTime: data.dueTime,
                reminderDatetime: data.reminderDate && data.reminderTime 
                    ? new Date(`${data.reminderDate}T${data.reminderTime}`)
                    : null,
            }
        };
        if (tx) return tx.task.create(payload);
        return prisma.task.create(payload);
    }

    static async update(id: string, data: Partial<UpdateTaskDTO>, tx?: Prisma.TransactionClient): Promise<Task> {
        const payload = {
            where: { id },
            data: {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            }
        };
        if (tx) return tx.task.update(payload);
        return prisma.task.update(payload);
    }

    static async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
        if (tx) return (await tx.task.delete({ where: { id } })) as any;
        await prisma.task.delete({ where: { id } });
    }
}
