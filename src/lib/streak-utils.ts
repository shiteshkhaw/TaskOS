import prisma from './prisma';

// Badge XP Values (Must match frontend)
export const BADGE_XP: Record<string, number> = {
    taskNovice: 25,
    taskMaster: 100,
    taskLegend: 500,
    streakStarter: 50,
    weekWarrior: 200,
    monthMaster: 1000,
    habitHero: 150,
    consistencyKing: 750,
    projectStarter: 100,
    projectPro: 500,
};

/**
 * Centralized logic to update a user's streak and award badges.
 * Can be called when a task, habit, or planner event is completed.
 */
export async function updateUserStreak(email: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get or create streak
    let streak = await prisma.streak.findUnique({
        where: { userEmail: email },
    });

    if (!streak) {
        streak = await prisma.streak.create({
            data: {
                userEmail: email,
                currentStreak: 0,
                longestStreak: 0,
                totalPoints: 100,
                perfectHabitDays: 0,
                badges: [],
                level: 1,
            },
        });
    }

    // Check if already updated today
    if (streak.lastActivityDate) {
        const lastActivity = new Date(streak.lastActivityDate);
        lastActivity.setUTCHours(0, 0, 0, 0);

        if (lastActivity.getTime() === today.getTime()) {
            return {
                updated: false,
                currentStreak: streak.currentStreak,
                totalPoints: streak.totalPoints,
                newBadges: [],
            };
        }
    }

    let pointsGained = 10; // Base points for any activity
    let newCurrentStreak = 1;

    // Calculate streak
    if (streak.lastActivityDate) {
        const lastActivity = new Date(streak.lastActivityDate);
        lastActivity.setUTCHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - lastActivity.getTime();
        const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            newCurrentStreak = (streak.currentStreak ?? 0) + 1;
            // Bonus points for longer streaks
            pointsGained += Math.floor(newCurrentStreak / 7) * 5;
        }
    }

    // Update longest streak
    const newLongestStreak = Math.max(streak.longestStreak ?? 0, newCurrentStreak);

    // Check for new badges
    const currentBadges = (streak.badges as string[]) || [];
    const newBadges: string[] = [];

    // 1. Task badges
    const totalTasks = await prisma.task.count({
        where: { userEmail: email, isComplete: true },
    });
    if (totalTasks >= 1 && !currentBadges.includes('taskNovice')) newBadges.push('taskNovice');
    if (totalTasks >= 10 && !currentBadges.includes('taskMaster')) newBadges.push('taskMaster');
    if (totalTasks >= 50 && !currentBadges.includes('taskLegend')) newBadges.push('taskLegend');

    // 2. Streak badges
    if (newCurrentStreak >= 3 && !currentBadges.includes('streakStarter')) newBadges.push('streakStarter');
    if (newCurrentStreak >= 7 && !currentBadges.includes('weekWarrior')) newBadges.push('weekWarrior');
    if (newCurrentStreak >= 30 && !currentBadges.includes('monthMaster')) newBadges.push('monthMaster');

    // 3. Consistency badge (7 perfect habit days)
    if ((streak.perfectHabitDays ?? 0) >= 7 && !currentBadges.includes('consistencyKing')) {
        newBadges.push('consistencyKing');
    }

    // Add XP for new badges
    if (newBadges.length > 0) {
        const xpFromBadges = newBadges.reduce((sum, badge) => sum + (BADGE_XP[badge] || 0), 0);
        pointsGained += xpFromBadges;
    }

    const allBadges = [...new Set([...currentBadges, ...newBadges])];
    const newTotalPoints = (streak.totalPoints ?? 0) + pointsGained;

    // Update streak in DB
    const updatedStreak = await prisma.streak.update({
        where: { userEmail: email },
        data: {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            totalPoints: newTotalPoints,
            lastActivityDate: today,
            badges: allBadges,
            level: Math.floor(newTotalPoints / 100) + 1,
        },
    });

    return {
        updated: true,
        currentStreak: updatedStreak.currentStreak,
        totalPoints: updatedStreak.totalPoints,
        newBadges,
        pointsGained,
    };
}

/**
 * Checks if all active habits for the day are completed.
 * If yes, increments the perfectHabitDays counter.
 */
export async function checkPerfectHabitDay(email: string) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Find all active habits for this user
    const activeHabits = await prisma.habit.findMany({
        where: {
            userEmail: email,
            isActive: true,
        },
    });

    if (activeHabits.length === 0) return false;

    // Check if all are completed today
    const allCompleted = activeHabits.every(h => {
        if (!h.completedToday || !h.lastCompleted) return false;
        return h.lastCompleted.toISOString().split('T')[0] === todayStr;
    });

    if (allCompleted) {
        // Idempotency check: don't increment if already counted today
        const streak = await prisma.streak.findUnique({
            where: { userEmail: email },
            select: { lastPerfectHabitDate: true }
        });

        if (streak?.lastPerfectHabitDate) {
            const lastPerfectDate = streak.lastPerfectHabitDate.toISOString().split('T')[0];
            if (lastPerfectDate === todayStr) {
                return false;
            }
        }
        
        await prisma.streak.update({
            where: { userEmail: email },
            data: {
                perfectHabitDays: { increment: 1 },
                lastPerfectHabitDate: today
            }
        });
        
        return true;
    }

    return false;
}
