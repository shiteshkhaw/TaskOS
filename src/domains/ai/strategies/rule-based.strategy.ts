import { AIPrioritizationStrategy } from '../ai.strategy';
import { TaskResponseDTO } from '@/domains/tasks/task.types';
import { AIScoredTask } from '../ai.types';

export class RuleBasedStrategy implements AIPrioritizationStrategy {
    async scoreTasks(tasks: TaskResponseDTO[]): Promise<AIScoredTask[]> {
        const now = new Date();

        return tasks.map(task => {
            let score = 0;
            const breakdown: Record<string, number> = {};

            // 1. Priority Weight (1-5) - Assuming 3 is default, scaled
            // Example: 1 is low, 5 is critical. If schema uses 1-3, we handle it:
            const basePriority = task.priority || 3;
            const priorityScore = basePriority * 2;
            score += priorityScore;
            breakdown['priority'] = priorityScore;

            // 2. Deadline Urgency & Overdue Penalty
            let deadlineScore = 0;
            let overdueScore = 0;
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                if (task.due_time) {
                    const [hours, minutes] = task.due_time.split(':').map(Number);
                    dueDate.setHours(hours, minutes, 0, 0);
                }

                const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

                if (diffHours < 0) {
                    // Overdue Penalty Boost
                    // Cap at -72 hours to prevent absurdly high scores for very old forgotten tasks
                    const cappedOverdue = Math.max(diffHours, -72);
                    overdueScore = Math.abs(cappedOverdue) * 1.5; 
                } else if (diffHours < 24) {
                    // Urgent (within 24 hours)
                    deadlineScore = 15;
                } else if (diffHours < 48) {
                    // Soon (within 48 hours)
                    deadlineScore = 8;
                } else {
                    // Later
                    deadlineScore = 2;
                }
            }
            score += deadlineScore;
            breakdown['deadline'] = deadlineScore;
            score += overdueScore;
            breakdown['overdue'] = overdueScore;

            // 3. Momentum (Simplified proxy: new tasks get a slight boost, or based on category)
            // Real momentum would look at recently completed tasks. 
            // For now, baseline deterministic momentum based on category existence
            const momentumScore = task.category ? 2 : 0; 
            score += momentumScore;
            breakdown['momentum'] = momentumScore;

            return {
                ...task,
                aiScore: score,
                aiBreakdown: breakdown,
            };
        });
    }
}
