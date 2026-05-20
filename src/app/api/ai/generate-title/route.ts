import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * Time-based title suggestions
 */
const TIME_SUGGESTIONS: Record<string, string[]> = {
    morning: [
        '☀️ Morning Planning Session',
        '🏃 Morning Workout',
        '☕ Coffee & Review',
        '📝 Morning Journaling',
        '🎯 Focus Block',
    ],
    afternoon: [
        '🤝 Team Meeting',
        '💼 Deep Work Session',
        '📊 Project Review',
        '🍽️ Lunch Break',
        '📞 Client Call',
    ],
    evening: [
        '🏠 Wind Down Time',
        '📖 Reading Session',
        '🎨 Creative Time',
        '👨‍👩‍👧 Family Time',
        '🌙 Evening Reflection',
    ],
    night: [
        '🌙 Late Work Session',
        '📚 Night Study',
        '🎵 Relaxation Time',
        '📝 Planning Tomorrow',
        '😴 Prepare for Sleep',
    ],
};

/**
 * POST /api/ai/generate-title
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { date, time } = body;

        if (!date || !time) {
            return errorResponse('Date and time are required', 400);
        }

        // Parse time to get time of day
        const [hours] = time.split(':').map(Number);

        let timeOfDay: string;
        if (hours >= 6 && hours < 12) {
            timeOfDay = 'morning';
        } else if (hours >= 12 && hours < 18) {
            timeOfDay = 'afternoon';
        } else if (hours >= 18 && hours < 24) {
            timeOfDay = 'evening';
        } else {
            timeOfDay = 'night';
        }

        const suggestions = TIME_SUGGESTIONS[timeOfDay];
        const randomTitle = suggestions[Math.floor(Math.random() * suggestions.length)];

        return successResponse({
            success: true,
            data: {
                suggested_title: randomTitle,
                alternatives: suggestions,
                time_of_day: timeOfDay,
            },
        });

    } catch (error) {
        console.error('AI generate title error:', error);
        return serverErrorResponse(`Failed to generate title: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
