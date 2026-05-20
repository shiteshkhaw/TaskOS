/**
 * XP values for different user actions
 */
export const XP_VALUES = {
    TASK_COMPLETED: 15,
    HABIT_COMPLETED: 10,
    PERFECT_DAY_BONUS: 50,
    STREAK_MILESTONE_7: 100,
    STREAK_MILESTONE_30: 500,
};

/**
 * Thresholds for badges
 */
export const BADGE_THRESHOLDS = {
    TASKS: {
        NOVICE: 1,
        MASTER: 10,
        LEGEND: 50,
    },
    STREAKS: {
        STARTER: 3,
        WARRIOR: 7,
        MASTER: 30,
    },
    PERFECT_DAYS: {
        KING: 7,
    },
};

/**
 * Badge XP rewards (Must match streak-utils.ts)
 */
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
 * Subscription limits for free users
 */
export const FREE_TIER_LIMITS = {
    MAX_GROUPS: 2,
    MAX_HABITS: 5,
};
