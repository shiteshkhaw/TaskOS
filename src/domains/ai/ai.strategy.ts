import { TaskResponseDTO } from '@/domains/tasks/task.types';
import { AIScoredTask } from './ai.types';

export interface AIPrioritizationStrategy {
    scoreTasks(tasks: TaskResponseDTO[]): Promise<AIScoredTask[]>;
}
