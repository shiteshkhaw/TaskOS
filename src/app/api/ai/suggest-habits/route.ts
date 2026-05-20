import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * Habit suggestion templates based on goals
 */
const HABIT_TEMPLATES: Record<string, Array<{ title: string; description: string; frequency: string }>> = {
    health: [
        { title: '💪 Morning Exercise', description: '30 minutes of physical activity', frequency: 'daily' },
        { title: '🥗 Eat Healthy Meals', description: 'Include vegetables in every meal', frequency: 'daily' },
        { title: '💧 Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', frequency: 'daily' },
        { title: '😴 Sleep 8 Hours', description: 'Maintain consistent sleep schedule', frequency: 'daily' },
    ],
    productivity: [
        { title: '📋 Plan Your Day', description: 'Write down top 3 priorities each morning', frequency: 'daily' },
        { title: '🎯 Deep Work Session', description: '2 hours of focused, uninterrupted work', frequency: 'daily' },
        { title: '📱 Digital Detox', description: '1 hour without phones/social media', frequency: 'daily' },
        { title: '📖 Read for 30 Minutes', description: 'Professional development or learning', frequency: 'daily' },
    ],
    mindfulness: [
        { title: '🧘 Morning Meditation', description: '10 minutes of mindfulness meditation', frequency: 'daily' },
        { title: '📝 Gratitude Journal', description: 'Write 3 things you are grateful for', frequency: 'daily' },
        { title: '🌬️ Deep Breathing', description: '5 minutes of deep breathing exercises', frequency: 'daily' },
        { title: '🚶 Mindful Walk', description: '15 minutes walk without distractions', frequency: 'daily' },
    ],
    learning: [
        { title: '📚 Learn Something New', description: '30 minutes of studying or learning', frequency: 'daily' },
        { title: '🎧 Educational Podcast', description: 'Listen during commute or exercise', frequency: 'daily' },
        { title: '✍️ Practice Writing', description: 'Write at least 500 words', frequency: 'daily' },
        { title: '💡 Review Notes', description: 'Review and consolidate learning', frequency: 'daily' },
    ],
};

/**
 * POST /api/ai/suggest-habits
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { goal } = body;

        if (!goal) {
            return errorResponse('Goal is required', 400);
        }

        const goalLower = goal.toLowerCase();

        let suggestions;

        // Match goal to category
        if (goalLower.includes('health') || goalLower.includes('fitness') || goalLower.includes('exercise') || goalLower.includes('weight')) {
            suggestions = HABIT_TEMPLATES.health;
        } else if (goalLower.includes('produc') || goalLower.includes('work') || goalLower.includes('efficien')) {
            suggestions = HABIT_TEMPLATES.productivity;
        } else if (goalLower.includes('mind') || goalLower.includes('stress') || goalLower.includes('calm') || goalLower.includes('peace')) {
            suggestions = HABIT_TEMPLATES.mindfulness;
        } else if (goalLower.includes('learn') || goalLower.includes('study') || goalLower.includes('skill') || goalLower.includes('educat')) {
            suggestions = HABIT_TEMPLATES.learning;
        } else {
            // Return mixed suggestions
            suggestions = [
                HABIT_TEMPLATES.health[0],
                HABIT_TEMPLATES.productivity[0],
                HABIT_TEMPLATES.mindfulness[0],
                HABIT_TEMPLATES.learning[0],
            ];
        }

        return successResponse({
            success: true,
            data: {
                goal,
                suggestions,
            },
        });

    } catch (error) {
        console.error('AI suggest habits error:', error);
        return serverErrorResponse(`Failed to suggest habits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
