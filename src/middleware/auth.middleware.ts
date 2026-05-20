import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/api-response';

export type AuthenticatedHandler = (
    request: NextRequest,
    context: { params: any; user: { email: string } }
) => Promise<Response>;

/**
 * Higher-order function to enforce JWT authentication.
 * Includes a temporary fallback to 'email' query param for zero-breakage rollout.
 */
export function withAuth(handler: AuthenticatedHandler) {
    return async (request: NextRequest, context: any) => {
        // Resolve params if they are a promise (Next.js 15 pattern)
        const params = context?.params ? await context.params : {};
        
        const user = getCurrentUser(request);
        let email = user?.email;

        // Fallback for transition phase (to be removed once frontend is updated)
        if (!email) {
            const { searchParams } = new URL(request.url);
            email = searchParams.get('email') || undefined;
            
            if (email && process.env.NODE_ENV !== 'production') {
                console.warn(`[AUTH] Route ${request.nextUrl.pathname} used deprecated email-param auth.`);
            }
        }

        if (!email) {
            return unauthorizedResponse('Authentication required');
        }

        return handler(request, { ...context, params, user: { email } });
    };
}
