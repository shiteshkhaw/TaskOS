import { NextRequest } from 'next/server';
import { AICoachService } from '@/domains/ai/services/ai-coach.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, prompt } = body;

        if (!email || !prompt) {
            return errorResponse('Email and prompt are required', 400);
        }

        const reply = await AICoachService.chat(email, prompt);

        return successResponse({
            success: true,
            reply,
            role: 'assistant'
        });
    } catch (error) {
        console.error('AI Coach Error:', error);
        return serverErrorResponse('Failed to process AI chat');
    }
}
