import prisma from './prisma';

export class TransactionManager {
    static async execute<T>(operation: (tx: any) => Promise<T>): Promise<T> {
        return await prisma.$transaction(async (tx) => {
            return await operation(tx);
        });
    }
}
