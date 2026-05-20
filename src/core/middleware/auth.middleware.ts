import { NextRequest } from 'next/server';
import { UnauthorizedError } from '../errors/custom-errors';
import { getCurrentUser } from '@/lib/auth';

export async function authenticateRequest(req: NextRequest) {
    // DO NOT allow URL params to authenticate, ONLY allow JWT Bearer tokens
    const userPayload = getCurrentUser(req);
    
    if (!userPayload) {
        throw new UnauthorizedError('Authentication required. Invalid or missing token.');
    }
    
    return { email: userPayload.email, user: userPayload }; 
}
