import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const idSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(10),
    offset: z.coerce.number().min(0).default(0),
});
