import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { forbiddenResponse } from '@/lib/api-response';
import { FeatureFlag, checkFeatureAccess } from '@/lib/feature-flags';
import { AuthenticatedHandler } from './auth.middleware';

/**
 * Middleware to enforce Pro tier access for specific features.
 */
export function withPro(feature: FeatureFlag, handler: AuthenticatedHandler) {
    return async (request: NextRequest, context: { params: any; user: { email: string } }) => {
        const user = await prisma.user.findUnique({
            where: { email: context.user.email },
            select: { isPro: true }
        });

        const isPro = !!user?.isPro;
        const hasAccess = await checkFeatureAccess({ isPro }, feature);

        if (!hasAccess) {
            return forbiddenResponse(`The ${feature.replace(/_/g, ' ').toLowerCase()} feature is only available on TaskOS Pro.`);
        }

        return handler(request, context);
    };
}
