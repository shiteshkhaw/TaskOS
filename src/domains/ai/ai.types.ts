import { TaskResponseDTO } from '@/domains/tasks/task.types';

export interface AIScoredTask extends TaskResponseDTO {
    aiScore: number;
    aiBreakdown?: Record<string, number>;
}

export type SortMode = 'normal' | 'smart';
