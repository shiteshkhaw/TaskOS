export interface XPAwardResult {
    updated: boolean;
    currentStreak: number;
    totalPoints: number;
    newBadges: string[];
    pointsGained: number;
    level: number;
}

export interface StreakData {
    userEmail: string;
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    lastActivityDate: string | null;
    perfectHabitDays: number;
    badges: string[];
    level: number;
}
