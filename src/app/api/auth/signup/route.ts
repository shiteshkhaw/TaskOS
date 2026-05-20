import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

interface SignupRequest {
    email: string;
    username: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: SignupRequest = await request.json();
        const { email, username, password } = body;

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse('Invalid email format', 400);
        }

        // Validate password length
        if (!password || password.length < 6) {
            return errorResponse('Password must be at least 6 characters long', 400);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return errorResponse('Email already registered', 400);
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user and streak in a transaction
        const newUser = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    username,
                    passwordHash,
                },
            });

            // Create initial streak with 100 XP registration bonus
            await tx.streak.create({
                data: {
                    userEmail: email,
                    currentStreak: 0,
                    longestStreak: 0,
                    totalPoints: 100, // Registration bonus
                    perfectHabitDays: 0,
                    badges: [],
                    level: 1,
                },
            });

            return user;
        });

        // Return response matching FastAPI format
        return successResponse({
            email: newUser.email,
            username: newUser.username,
            is_pro: newUser.isPro,
            created_at: newUser.createdAt?.toISOString() || new Date().toISOString(),
        }, 201);

    } catch (error) {
        console.error('Signup error:', error);
        return serverErrorResponse(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
