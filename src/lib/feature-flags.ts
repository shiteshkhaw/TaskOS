/**
 * Feature limits for different user tiers.
 */

export const FREE_TIER_LIMITS = {
    MAX_GROUPS: 2,
    MAX_HABITS: 5,
    AI_PRIORITIZATION: false,
    GROUP_ACTIVITY_FEED: false,
};

export const PRO_TIER_LIMITS = {
    MAX_GROUPS: Infinity,
    MAX_HABITS: Infinity,
    AI_PRIORITIZATION: true,
    GROUP_ACTIVITY_FEED: true,
};

export type FeatureFlag = keyof typeof FREE_TIER_LIMITS;

/**
 * Checks if a user has access to a specific feature.
 */
export async function checkFeatureAccess(user: { isPro: boolean }, feature: FeatureFlag): Promise<boolean> {
    if (user.isPro) {
        return PRO_TIER_LIMITS[feature] !== false;
    }
    return FREE_TIER_LIMITS[feature] !== false;
}
