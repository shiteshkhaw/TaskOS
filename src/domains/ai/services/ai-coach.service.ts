import { TaskService } from '@/domains/tasks/task.service';
import { HabitRepository } from '@/domains/habits/habit.repository';
import { prisma } from '@/core/db/prisma';
import { logger } from '@/core/logger/logger';

export class AICoachService {
    static async chat(email: string, prompt: string): Promise<string> {
        logger.info('[AICoach] Gathering context for AI chat', { email });

        // 1. Gather Context
        const tasks = await TaskService.listTasks(email, 'smart');
        const activeTasks = tasks.filter(t => !t.is_complete).slice(0, 5); // Top 5 priority
        
        const habits = await HabitRepository.findAllByUser(email);
        const incompleteHabits = habits.filter(h => h.isActive && !h.completedToday);
        
        const streak = await prisma.streak.findUnique({ where: { userEmail: email } });

        // 2. Build System Prompt Context
        const contextString = `
Current User State:
- Top 5 Pending Tasks: ${JSON.stringify(activeTasks.map(t => ({ title: t.title, priority: t.priority, due: t.due_date })))}
- Incomplete Habits Today: ${JSON.stringify(incompleteHabits.map(h => ({ title: h.title, streak: h.streakCount })))}
- Current Overall Streak: ${streak?.currentStreak || 0} days
- Local Time context: The user is currently working on these tasks.
`;

        const fullPrompt = `You are the TaskOS AI Productivity Coach. Your goal is to help the user prioritize, overcome procrastination, and maintain their streaks. Keep your responses concise, actionable, and encouraging (under 100 words if possible).
        
${contextString}

User Query: "${prompt}"

Provide your coaching advice:`;

        // 3. Call Groq API
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            logger.warn('[AICoach] GROQ_API_KEY not found. Returning mock response.');
            return this.getMockResponse(prompt, activeTasks.length, incompleteHabits.length);
        }

        try {
            logger.debug('[AICoach] Calling Groq API');
            const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: fullPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const replyText = data.choices?.[0]?.message?.content;
            
            return replyText || "I couldn't generate advice right now. Focus on your top priority task!";
        } catch (error) {
            logger.error('[AICoach] LLM API call failed', { error });
            return "I'm having trouble connecting to my neural network. Stick to the basics: tackle your highest priority task first!";
        }
    }

    private static getMockResponse(prompt: string, taskCount: number, habitCount: number): string {
        return `I am currently running in offline mode. Based on your profile, you have ${taskCount} top tasks and ${habitCount} habits left today. I recommend starting with the highest priority task first, then completing a quick habit to build momentum!`;
    }
}
