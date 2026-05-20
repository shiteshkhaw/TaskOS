import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET environment variable must be set in production');
        }
        // Development fallback only
        return 'dev-only-fallback-secret-not-for-production';
    }
    return secret;
}

const JWT_SECRET = getJwtSecret();

export interface JWTPayload {
    email: string;
    username?: string;
    iat?: number;
    exp?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: { email: string; username?: string }): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' } as any);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Get current user from request
 */
export function getCurrentUser(request: NextRequest): JWTPayload | null {
    const token = extractTokenFromHeader(request);
    if (!token) return null;
    return verifyToken(token);
}
