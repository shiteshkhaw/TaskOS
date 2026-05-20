import { AppError } from '../errors/custom-errors';

const requests = new Map<string, number[]>();

export async function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000) {
    const now = Date.now();
    const timestamps = requests.get(ip) || [];
    
    const recent = timestamps.filter(ts => now - ts < windowMs);
    
    if (recent.length >= limit) {
        throw new AppError('Too many requests', 429);
    }
    
    recent.push(now);
    requests.set(ip, recent);
}
