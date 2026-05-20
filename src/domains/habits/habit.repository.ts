import prisma from '@/core/db/prisma';
import { PrismaClient, Habit } from '@/generated/prisma';
import { CreateHabitDTO, UpdateHabitDTO } from './habit.types';

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export class HabitRepository {
    static async findAllByUser(email: string, tx?: TransactionClient): Promise<Habit[]> {
        const client = (tx || prisma) as PrismaClient;
        return await client.habit.findMany({
            where: { userEmail: email },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async findById(id: string, tx?: TransactionClient): Promise<Habit | null> {
        const client = (tx || prisma) as PrismaClient;
        return await client.habit.findUnique({ where: { id } });
    }

    static async create(data: CreateHabitDTO, tx?: TransactionClient): Promise<Habit> {
        const client = (tx || prisma) as PrismaClient;
        return await client.habit.create({
            data: {
                title: data.title,
                description: data.description,
                userEmail: data.userEmail,
                frequency: data.frequency,
                reminderTime: data.reminderTime,
                isActive: true,
                streakCount: 0,
                totalCompletions: 0,
                completedToday: false,
            },
        });
    }

    static async update(id: string, data: Partial<UpdateHabitDTO>, tx?: TransactionClient): Promise<Habit> {
        const client = (tx || prisma) as PrismaClient;
        return await client.habit.update({
            where: { id },
            data,
        });
    }

    static async delete(id: string, tx?: TransactionClient): Promise<void> {
        const client = (tx || prisma) as PrismaClient;
        await client.habit.delete({ where: { id } });
    }
}
