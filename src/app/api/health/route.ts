import { successResponse } from '@/lib/api-response';

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET() {
    return successResponse({
        status: 'healthy',
        service: 'TaskGuru Next.js API',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        features: [
            'Authentication',
            'Tasks CRUD',
            'Habits CRUD',
            'Planner Events',
            'Groups Collaboration',
            'Streak & Badges',
            'AI Suggestions',
            'Razorpay Payments',
            'Push Notifications',
        ],
    });
}
