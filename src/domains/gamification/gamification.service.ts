import prisma from '@/lib/prisma';

// Simple in-memory cache for leaderboard (Best-case practice)
let leaderboardCache: { data: any, timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export class GamificationService {
    /**
     * Fetches the global leaderboard with 60s caching.
     */
    static async getLeaderboard() {
        const now = Date.now();
        if (leaderboardCache && (now - leaderboardCache.timestamp < CACHE_TTL)) {
            return leaderboardCache.data;
        }

        const streaks = await prisma.streak.findMany({
            orderBy: { totalPoints: 'desc' },
            take: 50,
            select: {
                userEmail: true,
                totalPoints: true,
                level: true,
                currentStreak: true,
                user: {
                    select: {
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        const data = streaks.map((s, index) => ({
            rank: index + 1,
            name: s.user?.username || s.userEmail.split('@')[0],
            points: s.totalPoints ?? 0,
            level: s.level ?? 1,
            streak: s.currentStreak ?? 0,
            avatar: s.user?.avatarUrl
        }));

        leaderboardCache = { data, timestamp: now };
        return data;
    }

    /**
     * Redeem points for Pro status (Atomic Transaction).
     */
    static async redeemProWithPoints(email: string) {
        const POINTS_REQUIRED = 5000;

        return prisma.$transaction(async (tx) => {
            const streak = await tx.streak.findUnique({ 
                where: { userEmail: email } 
            });

            if (!streak || (streak.totalPoints ?? 0) < POINTS_REQUIRED) {
                throw new Error(`Insufficient points. You need ${POINTS_REQUIRED} points.`);
            }

            // 1. Deduct points
            await tx.streak.update({
                where: { userEmail: email },
                data: { totalPoints: { decrement: POINTS_REQUIRED } }
            });

            // 2. Upgrade user
            return tx.user.update({
                where: { email },
                data: { isPro: true }
            });
        });
    }
    static async awardPoints(email: string, points: number) {
        return prisma.streak.upsert({
            where: { userEmail: email },
            update: { 
                totalPoints: { increment: points },
                lastActivityDate: new Date()
            },
            create: {
                userEmail: email,
                currentStreak: 0,
                longestStreak: 0,
                totalPoints: 100 + points, // Registration bonus + earned points
                perfectHabitDays: 0,
                badges: [],
                level: 1,
                lastActivityDate: new Date(),
            }
        });
    }
}
