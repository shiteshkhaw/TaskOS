import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * Task breakdown templates based on keywords
 */
const TEMPLATES: Record<string, string[]> = {
    website: [
        'Set up project structure',
        'Design wireframes/mockups',
        'Implement responsive layout',
        'Add navigation and routing',
        'Build core pages',
        'Integrate backend APIs',
        'Add styling and animations',
        'Test across devices',
        'Deploy to production',
    ],
    app: [
        'Define app requirements',
        'Set up development environment',
        'Create basic UI components',
        'Implement navigation',
        'Build main features',
        'Connect to backend',
        'Add user authentication',
        'Test thoroughly',
        'Publish to app store',
    ],
    learn: [
        'Find quality resources (courses, books, tutorials)',
        'Create study schedule',
        'Take notes and summarize key concepts',
        'Practice with exercises',
        'Build a small project',
        'Review and reinforce',
        'Test your knowledge',
    ],
    event: [
        'Define event goals and theme',
        'Create guest list',
        'Book venue/location',
        'Send invitations',
        'Plan activities/agenda',
        'Arrange food and drinks',
        'Set up decorations',
        'Confirm final details',
    ],
    writing: [
        'Research and gather information',
        'Create outline',
        'Write first draft',
        'Review and revise',
        'Get feedback',
        'Final editing',
        'Publish/submit',
    ],
    default: [
        'Define goals and scope',
        'Break into smaller steps',
        'Gather resources',
        'Start with first step',
        'Review progress',
        'Complete remaining tasks',
        'Final review',
    ],
};

/**
 * POST /api/ai/break-down-task
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title } = body;

        if (!title) {
            return errorResponse('Title is required', 400);
        }

        const titleLower = title.toLowerCase();

        let subtasks: string[];

        // Match against templates
        if (titleLower.includes('website') || titleLower.includes('web')) {
            subtasks = TEMPLATES.website;
        } else if (titleLower.includes('app') || titleLower.includes('mobile')) {
            subtasks = TEMPLATES.app;
        } else if (titleLower.includes('learn') || titleLower.includes('study') || titleLower.includes('course')) {
            subtasks = TEMPLATES.learn;
        } else if (titleLower.includes('event') || titleLower.includes('party') || titleLower.includes('meeting')) {
            subtasks = TEMPLATES.event;
        } else if (titleLower.includes('write') || titleLower.includes('article') || titleLower.includes('blog')) {
            subtasks = TEMPLATES.writing;
        } else {
            subtasks = TEMPLATES.default;
        }

        return successResponse({
            success: true,
            data: {
                original_task: title,
                subtasks: subtasks.map((s, i) => ({ id: i + 1, title: s, done: false })),
            },
        });

    } catch (error) {
        console.error('AI break down task error:', error);
        return serverErrorResponse(`Failed to break down task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
