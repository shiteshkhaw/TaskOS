import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

interface LoginRequest {
    email: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();
        const { email, password } = body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.passwordHash) {
            return unauthorizedResponse('Invalid email or password');
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return unauthorizedResponse('Invalid email or password');
        }

        // Generate JWT token
        const token = generateToken({ email: user.email, username: user.username || undefined });

        // Return response matching FastAPI format
        return successResponse({
            message: 'Login successful',
            access_token: token,
            token_type: 'bearer',
            user: {
                email: user.email,
                username: user.username,
                is_pro: user.isPro,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
}
